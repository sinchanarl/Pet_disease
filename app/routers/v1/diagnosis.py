from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.utils.db_init import get_db
from app.models.pet_scan import PetScan
from app.models.pet_kb import PetKB
from app.services.gemini import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.get("/{scan_id}/diagnosis")
async def get_combined_diagnosis(scan_id: str, db: AsyncSession = Depends(get_db)):
    """
    Combined diagnosis endpoint:
    1. Fetches scan data
    2. Fetches KB treatment
    3. Fetches AI diagnosis
    Returns all in one response.
    """
    # 1) Get Scan Data
    query = select(PetScan).where(PetScan.id == scan_id)
    result = await db.execute(query)
    scan = result.scalars().first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    res_data = scan.result or {}
    qa = res_data.get("qa", {})
    
    pet_name = qa.get("detected_pet", "Pet")
    disease_name = qa.get("suspected_condition", "None") or "None"
    
    # 2) Fetch KB Treatment
    kb_treatment = "No specific treatment found in knowledge base."
    if disease_name != "None":
        kb_query = select(PetKB).where(
            PetKB.pet_name.ilike(f"%{pet_name}%"),
            PetKB.disease_name.ilike(f"%{disease_name}%")
        )
        kb_result = await db.execute(kb_query)
        kb_entry = kb_result.scalars().first()
        if kb_entry:
            kb_treatment = kb_entry.treatment
            
    # 3) Fetch AI Full Diagnosis (Gemini)
    ai_status = "ok"
    full_diag = {
        "disease_overview": "",
        "common_symptoms": [],
        "general_treatment": [],
        "home_care_tips": [],
        "when_to_visit_vet": [],
        "disclaimer": ""
    }
    
    if disease_name != "None":
        try:
            full_diag = await gemini_service.get_full_diagnosis(pet_name, disease_name)
        except Exception as e:
            logger.error(f"Gemini diagnosis failed for scan {scan_id}: {e}")
            ai_status = "failed"
            full_diag["disease_overview"] = f"Information about {disease_name} in {pet_name} currently unavailable."
            full_diag["disclaimer"] = "AI Diagnosis service is currently unavailable."
    else:
        full_diag["disease_overview"] = "The pet looks healthy. No disease detected."
        full_diag["disclaimer"] = "AI assessment based on visual scan."

    # 4) Construct Response
    return {
        "pet_name": pet_name,
        "disease_name": disease_name,
        "summary": {
            "scan_id": scan.id,
            "is_healthy": scan.is_healthy,
            "severity": qa.get("severity") or (None if scan.is_healthy else "unknown")
        },
        "kb": {
            "treatment": kb_treatment
        },
        "full_diagnosis": full_diag,
        "ai_status": ai_status
    }
