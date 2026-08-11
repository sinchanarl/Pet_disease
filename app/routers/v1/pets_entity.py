from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid

from app.utils.db_init import get_db
from app.models.pet import Pet

router = APIRouter(prefix="/pets", tags=["Pets (Entities)"])

class PetCreate(BaseModel):
    pet_name: str
    pet_type: str
    age: Optional[int] = None
    gender: Optional[str] = None

class PetResponse(PetCreate):
    id: str
    
    class Config:
        from_attributes = True

@router.post("/", response_model=PetResponse)
async def create_pet(pet_data: PetCreate, db: AsyncSession = Depends(get_db)):
    """Create a new pet profile."""
    new_pet = Pet(
        pet_name=pet_data.pet_name,
        pet_type=pet_data.pet_type,
        age=pet_data.age,
        gender=pet_data.gender
    )
    db.add(new_pet)
    await db.commit()
    await db.refresh(new_pet)
    return new_pet

@router.get("/", response_model=List[PetResponse])
async def list_pets(db: AsyncSession = Depends(get_db)):
    """List all pets."""
    result = await db.execute(select(Pet).order_by(Pet.created_at.desc()))
    return result.scalars().all()

@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: str, db: AsyncSession = Depends(get_db)):
    """Get pet details."""
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalars().first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet
