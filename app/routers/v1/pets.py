from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import logging

from app.services.gemini import gemini_service
from app.utils.db_init import get_db
from app.models.pet_scan import PetScan

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/scan")
async def scan_pet(
    image: UploadFile = File(...),
    pet_name: str = Form("Unknown"),
    db: AsyncSession = Depends(get_db),
):
    logger.info(f"--- Scan Start: pet_name={pet_name} ---")
    
    # 1) Read image bytes
    image_bytes = await image.read()
    if not image_bytes:
        logger.error("Scan failed: Empty image uploaded")
        raise HTTPException(status_code=400, detail="Empty image file uploaded.")

    try:
        # 2) Run QA Analysis
        content_type = image.content_type or "image/jpeg"
        logger.info(f"Calling Gemini QA for {pet_name} (type: {content_type})...")
        qa_result = await gemini_service.run_qa_analysis(image_bytes, pet_type=pet_name, mime_type=content_type)
        logger.info(f"QA Result: {qa_result}")

        # 3) Not a valid pet
        if not qa_result.get("is_valid_pet", False):
            logger.warning(f"Detection rejected: {qa_result.get('detected_pet', 'Unknown')}")
            return {
                "is_valid_pet": False,
                "message": "The image is not a valid pet image. Please upload a clear pet image.",
                "qa_details": qa_result,
            }

        # 4) Generate Bounding Boxes
        logger.info("Generating bounding boxes...")
        bbox_result = await gemini_service.generate_bounding_boxes(image_bytes, mime_type=content_type)
        logger.info(f"BBOX Result: {bbox_result}")

        # 5) Combine result
        combined_result = {
            "qa": qa_result,
            "bboxes": bbox_result.get("detections", []),
        }

        # 6) Save to PostgreSQL
        scan_id = f"petscan_{uuid.uuid4().hex[:8]}"
        new_scan = PetScan(
            id=scan_id,
            is_valid_pet=True,
            is_healthy=qa_result.get("is_healthy", True),
            result=combined_result,
        )

        logger.info(f"Saving scan {scan_id} to database...")
        db.add(new_scan)
        await db.commit()
        await db.refresh(new_scan)
        logger.info(f"Scan {scan_id} saved successfully.")

        # 7) Return response
        return {
            "scan_id": scan_id,
            "is_valid_pet": True,
            "is_healthy": new_scan.is_healthy,
            "analysis": combined_result,
            "message": "Scan completed successfully.",
        }

    except ValueError as ve:
        logger.error(f"Configuration error: {ve}")
        # Custom handling for missing API key
        if "GEMINI_API_KEY" in str(ve):
            raise HTTPException(
                status_code=503, 
                detail="Gemini service is unavailable: GEMINI_API_KEY is missing."
            )
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception(f"Scan failed for {pet_name}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
