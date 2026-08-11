import asyncio
import json
import logging
from typing import Any, Dict, Optional

from google import genai
from google.genai import types

from app.config.settings import settings

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self._client = None
        # Models from settings
        self.primary_model = settings.GEMINI_MODEL_PRIMARY
        self.fallback_model = settings.GEMINI_MODEL_FALLBACK

    @property
    def client(self) -> genai.Client:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        if self._client is None:
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return self._client

    async def _generate_with_retry(
        self,
        prompt: str,
        image_data: bytes,
        mime_type: str = "image/jpeg",
        use_fallback: bool = False,
        retries: int = 2,
        response_mime_type: str = "application/json",
    ) -> str:
        model = self.fallback_model if use_fallback else self.primary_model

        for attempt in range(retries):
            try:
                # Ensure client is available
                client = self.client
                loop = asyncio.get_running_loop()
                resp = await loop.run_in_executor(
                    None,
                    lambda: client.models.generate_content(
                        model=model,
                        contents=[
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part(text=prompt),
                                    types.Part(
                                        inline_data=types.Blob(
                                            mime_type=mime_type,
                                            data=image_data,
                                        )
                                    ),
                                ],
                            )
                        ],
                        config=types.GenerateContentConfig(
                            temperature=0,
                            top_p=0.1,
                            candidate_count=1,
                            response_mime_type=response_mime_type,  # Force JSON mode
                        ),
                    ),
                )
                return resp.text

            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed (model={model}): {e}")

                # Last attempt -> try fallback once
                if attempt == retries - 1:
                    if not use_fallback:
                        logger.info("Switching to fallback model")
                        return await self._generate_with_retry(
                            prompt=prompt,
                            image_data=image_data,
                            mime_type=mime_type,
                            use_fallback=True,
                            retries=1,
                            response_mime_type=response_mime_type,
                        )
                    raise

                await asyncio.sleep(2 ** attempt)

        raise RuntimeError("Gemini call failed unexpectedly")

    @staticmethod
    def _parse_json(text: str) -> Dict[str, Any]:
        # In JSON mode, it should already be clean; but keep a safe cleanup
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)

    # ------------------------------------------------------------------
    # 1) QA PROMPT (Quick check)
    # ------------------------------------------------------------------
    async def run_qa_analysis(self, image_data: bytes, pet_type: str, mime_type: str = "image/jpeg") -> Dict[str, Any]:
        prompt = f"""
Role: Senior Veterinary Doctor and Pet Health Screening AI.

Task: Perform a quick visual QA check.

1. Verify whether a pet animal is present.
2. Identify the pet type (dog, cat, bird, fish, rabbit, etc).
3. Compare with user claim: "{pet_type}".
4. Decide if the pet looks healthy.
5. If unhealthy, name the suspected condition briefly.

STRICT JSON ONLY:
{{
  "is_valid_pet": true/false,
  "detected_pet": "",
  "is_healthy": true/false,
  "suspected_condition": "" 
}}
"""
        text = await self._generate_with_retry(prompt, image_data, mime_type=mime_type)
        return self._parse_json(text)

    # ------------------------------------------------------------------
    # 2) FULL DIAGNOSTIC PROMPT
    # ------------------------------------------------------------------
    async def run_diagnostic_analysis(
        self,
        image_data: bytes,
        pet_name: str,
        lang_target: str = "English",
        mime_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        prompt = f"""
Role: You are an expert Veterinary Disease Specialist and Animal Health Advisory System.

Task:
Analyze the attached image of a pet to perform a comprehensive species validation,
disease diagnosis, and health advisory generation.

[LANGUAGE INSTRUCTION]:
- JSON KEYS must remain exactly as defined (English)
- JSON VALUES should be in {lang_target}
- Scientific names of pathogens should remain in Latin where applicable.

[CONTEXT]:
The user claims this is a "{pet_name}".

Output Rules:
- STRICT JSON ONLY
- No markdown
- No extra text

JSON FORMAT:
{{
  "is_valid_pet": true,
  "detected_pet_type": "",
  "pet_info": {{
    "common_name": "",
    "scientific_name": ""
  }},
  "disease_info": {{
    "common_name": "",
    "scientific_name": "",
    "pathogen_type": "",
    "cause": "",
    "symptoms": "",
    "transmission_mode": "",
    "severity": ""
  }},
  "management": {{
    "home_care": [],
    "veterinary_treatment": []
  }}
}}
"""
        # Prefer fallback/pro if you want heavier reasoning, but you can keep primary too.
        text = await self._generate_with_retry(prompt, image_data, mime_type=mime_type, use_fallback=True, retries=2)
        return self._parse_json(text)

    # ------------------------------------------------------------------
    # 3) BOUNDING BOX PROMPT (JSON coordinates)
    # ------------------------------------------------------------------
    async def generate_bounding_boxes(self, image_data: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
        prompt = """
You are a computer vision analysis system specialized in veterinary image assessment.

IMPORTANT (STRICT RULES):
- DO NOT generate, modify, or describe new images.
- ONLY analyze the image provided as input.
- DO NOT hallucinate bounding boxes.
- If no affected area is visible, return an empty detections list.

TASK:
Analyze the provided pet image and identify ONLY the visibly affected areas
(e.g., wound, rash, swelling, infection, redness, hair loss, parasites).

INSTRUCTIONS:
1. Draw a bounding box for EACH distinct affected area visible on the pet.
2. Do NOT group multiple affected areas into a single box.
3. Each bounding box must be tightly fitted around the visible abnormality.
4. Use a coordinate scale from 0 to 1000.
5. Format: [ymin, xmin, ymax, xmax].

OUTPUT FORMAT (STRICT):
Return ONLY valid JSON:
{
  "detections": [
    {
      "label": "Affected area",
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ]
}
"""
        text = await self._generate_with_retry(prompt, image_data, mime_type=mime_type)
        return self._parse_json(text)

    # ------------------------------------------------------------------
    # 4) FULL DIAGNOSTIC TEXT PROMPT (NEW)
    # ------------------------------------------------------------------
    async def get_full_diagnosis(
        self,
        pet_name: str,
        disease_name: str,
        lang_target: str = "English"
    ) -> Dict[str, Any]:
        """
        Generates a full textual diagnosis based on the detected pet and disease.
        No image needed for this textual expansion.
        """
        prompt = f"""
Role: Expert Veterinary Health Assistant.

Context:
- Pet: {pet_name}
- Suspected Disease: {disease_name}

Task:
Generate a structured diagnosis and home care guide in {lang_target}.

JSON Format:
{{
  "disease_overview": "A brief explanation of {disease_name} in {pet_name}.",
  "common_symptoms": ["symptom 1", "symptom 2"],
  "general_treatment": ["treatment 1", "treatment 2"],
  "home_care_tips": ["tip 1", "tip 2"],
  "when_to_visit_vet": ["indicator 1", "indicator 2"],
  "disclaimer": "This is AI-generated and not a substitute for professional veterinary advice."
}}
"""
        # We use a simple generate call without image here
        client = self.client
        loop = asyncio.get_running_loop()
        resp = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=self.primary_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    response_mime_type="application/json",
                ),
            ),
        )
        return self._parse_json(resp.text)


gemini_service = GeminiService()
