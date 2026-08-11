from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.utils.db_init import get_db
from app.models.pet_kb import PetKB

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

class RecommendationRequest(BaseModel):
    pet_name: str
    disease_name: str
    severity: Optional[str] = "unknown"

@router.post("/home-care")
async def get_home_care(req: RecommendationRequest, db: AsyncSession = Depends(get_db)):
    """Fetch home care guidance based on KB and AI rules."""
    query = select(PetKB).where(
        PetKB.pet_name.ilike(req.pet_name),
        PetKB.disease_name.ilike(req.disease_name)
    )
    result = await db.execute(query)
    kb_entry = result.scalars().first()
    
    treatment = kb_entry.treatment if kb_entry else "No specific treatment found in KB."
    
    return {
        "treatment_guidance": treatment,
        "home_care_bullets": [
            "Ensure a calm and quiet environment for recovery.",
            "Monitor food and water intake closely.",
            "Keep the pet isolated if a contagious condition is suspected.",
            "Follow all prescribed medication schedules strictly."
        ],
        "disclaimer": "This is AI-generated advice. Consult a certified veterinarian before starting any treatment."
    }

@router.post("/emergency")
async def check_emergency(req: RecommendationRequest):
    """Determine if the situation requires immediate veterinary attention."""
    
    is_emergency = False
    reason = "Symptoms appear manageable at home, but monitor closely."
    next_steps = ["Schedule a regular vet appointment", "Monitor for worsening symptoms"]
    
    disease = req.disease_name.lower()
    severity = req.severity.lower() if req.severity else ""
    
    if "rabies" in disease or "parvovirus" in disease:
        is_emergency = True
        reason = f"Condition '{req.disease_name}' is highly life-threatening and requires immediate isolation and treatment."
        next_steps = ["GO TO EMERGENCY VET NOW", "Isolate pet immediately"]
    elif severity in ["severe", "critical"]:
        is_emergency = True
        reason = "Severity level is critical. Vital functions may be at risk."
        next_steps = ["Contact emergency clinic immediately", "Prepare pet for transport"]
        
    return {
        "is_emergency": is_emergency,
        "reason": reason,
        "next_steps": next_steps
    }
