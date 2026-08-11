from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, distinct, delete
from pydantic import BaseModel
from typing import List, Optional

from app.utils.db_init import get_db
from app.models.pet_kb import PetKB

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])

class KBEntryCreate(BaseModel):
    pet_name: str
    disease_name: str
    treatment: str

@router.get("/")
async def get_kb(
    pet_name: Optional[str] = Query(None),
    disease_name: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(PetKB)
    if pet_name:
        query = query.where(PetKB.pet_name.ilike(f"%{pet_name}%"))
    if disease_name:
        query = query.where(PetKB.disease_name.ilike(f"%{disease_name}%"))
    
    result = await db.execute(query)
    items = result.scalars().all()
    return items

@router.get("/treatment")
async def get_treatment(
    pet_name: str = Query(...),
    disease_name: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    query = select(PetKB).where(
        PetKB.pet_name.ilike(pet_name),
        PetKB.disease_name.ilike(disease_name)
    )
    result = await db.execute(query)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Treatment not found in KB")
    return item

@router.get("/diseases")
async def get_kb_diseases(
    pet_name: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List distinct diseases in the KB."""
    query = select(distinct(PetKB.disease_name))
    if pet_name:
        query = query.where(PetKB.pet_name.ilike(f"%{pet_name}%"))
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", status_code=201)
async def create_kb_entry(entry: KBEntryCreate, db: AsyncSession = Depends(get_db)):
    """Add a new entry to the Knowledge Base."""
    new_entry = PetKB(**entry.dict())
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

@router.put("/{id}")
async def update_kb_entry(id: int, entry: KBEntryCreate, db: AsyncSession = Depends(get_db)):
    """Update an existing KB entry."""
    result = await db.execute(select(PetKB).where(PetKB.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="KB entry not found")
    
    item.pet_name = entry.pet_name
    item.disease_name = entry.disease_name
    item.treatment = entry.treatment
    
    await db.commit()
    return item

@router.delete("/{id}")
async def delete_kb_entry(id: int, db: AsyncSession = Depends(get_db)):
    """Delete a KB entry."""
    result = await db.execute(select(PetKB).where(PetKB.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="KB entry not found")
    
    await db.delete(item)
    await db.commit()
    return {"message": "KB entry deleted"}
