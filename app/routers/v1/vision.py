from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import logging

from app.services.gemini import gemini_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vision", tags=["Vision Only"])

@router.post("/validate")
async def validate_pet(image: UploadFile = File(...)):
    """Quickly validate if the image contains a pet."""
    try:
        image_bytes = await image.read()
        # Use an empty string for pet_type since we are just validating
        qa_result = await gemini_service.run_qa_analysis(image_bytes, pet_type="unknown")
        
        return {
            "is_valid_pet": qa_result.get("is_valid_pet", False),
            "confidence": 0.95 if qa_result.get("is_valid_pet") else 0.1 # Gemini doesn't always return confidence, as fake here
        }
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        # If it's likely a quota issue (simplified check)
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(status_code=503, detail="Gemini API quota exceeded. Please try again later.")
        raise HTTPException(status_code=500, detail="Vision validation failed.")

@router.post("/bboxes")
async def detect_bboxes(
    image: UploadFile = File(...),
    disease_name: Optional[str] = Form(None)
):
    """Generate bounding boxes for affected areas."""
    try:
        image_bytes = await image.read()
        bbox_result = await gemini_service.generate_bounding_boxes(image_bytes)
        return bbox_result
    except Exception as e:
        logger.error(f"BBOX detection failed: {e}")
        raise HTTPException(status_code=500, detail="Spatial analysis failed.")
