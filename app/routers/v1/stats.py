from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict

from app.utils.db_init import get_db
from app.models.pet_scan import PetScan

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/scans")
async def get_scan_stats(db: AsyncSession = Depends(get_db)):
    """Return counts for total, healthy, and unhealthy scans."""
    total = await db.scalar(select(func.count(PetScan.id)))
    healthy = await db.scalar(select(func.count(PetScan.id)).where(PetScan.is_healthy == True))
    unhealthy = await db.scalar(select(func.count(PetScan.id)).where(PetScan.is_healthy == False))
    
    return {
        "total_scans": total or 0,
        "healthy": healthy or 0,
        "unhealthy": unhealthy or 0
    }

@router.get("/diseases")
async def get_top_diseases(db: AsyncSession = Depends(get_db)):
    """Aggregate top diseases from scan results."""
    # Since disease name is likely in the 'result' JSON or we should have a disease_name column
    # For now, we try to extract from the JSON if possible, or return empty if schema is simple
    # Assuming PetScan.result has {"qa": {"suspected_condition": "..."}}
    
    query = select(PetScan.result).where(PetScan.is_healthy == False)
    result = await db.execute(query)
    scans_results = result.scalars().all()
    
    disease_counts = {}
    for res in scans_results:
        if res and isinstance(res, dict):
            qa = res.get("qa", {})
            disease = qa.get("suspected_condition")
            if disease:
                disease_counts[disease] = disease_counts.get(disease, 0) + 1
                
    # Sort and format
    sorted_diseases = sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {"disease_name": d, "count": c} for d, c in sorted_diseases[:10]
    ]
