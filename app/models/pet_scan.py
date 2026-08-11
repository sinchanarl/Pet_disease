from sqlalchemy import Column, String, Boolean, JSON, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class PetScan(Base):
    __tablename__ = "pet_scans"

    id = Column(String, primary_key=True, default=lambda: f"petscan_{uuid.uuid4().hex[:8]}")
    is_valid_pet = Column(Boolean, default=False)
    is_healthy = Column(Boolean, default=True)
    result = Column(JSON, nullable=True) # Combined QA and BBOX results
    created_at = Column(DateTime, default=datetime.utcnow)
