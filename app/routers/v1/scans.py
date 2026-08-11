from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.utils.db_init import get_db
from app.models.pet_scan import PetScan

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scans", tags=["Scans"])

@router.get("/")
async def get_scans(
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    query = select(PetScan).order_by(PetScan.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    scans = result.scalars().all()
    return scans

@router.get("/{scan_id}")
async def get_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    query = select(PetScan).where(PetScan.id == scan_id)
    result = await db.execute(query)
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@router.get("/{scan_id}/summary")
async def get_scan_summary(scan_id: str, db: AsyncSession = Depends(get_db)):
    """Return a brief health summary of the scan."""
    query = select(PetScan).where(PetScan.id == scan_id)
    result = await db.execute(query)
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Extract from result JSON
    res_data = scan.result or {}
    qa = res_data.get("qa", {})
    
    return {
        "scan_id": scan.id,
        "is_healthy": scan.is_healthy,
        "disease": qa.get("suspected_condition", "None"),
        "severity": qa.get("severity") or "unknown",
        "timestamp": scan.created_at
    }

@router.post("/{scan_id}/reanalyze")
async def reanalyze_scan(scan_id: str):
    """Re-run AI analysis using stored image (Stub)."""
    # Since we don't store images locally/S3 in the current 'local' mode setup, we return 501
    raise HTTPException(
        status_code=501, 
        detail="Re-analysis is not yet implemented as original images are not persistently stored in local mode."
    )

@router.delete("/{scan_id}")
async def delete_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a scan record (hard delete)."""
    query = select(PetScan).where(PetScan.id == scan_id)
    result = await db.execute(query)
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    await db.delete(scan)
    await db.commit()
    return {"message": f"Scan {scan_id} deleted successfully."}
