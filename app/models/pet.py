from sqlalchemy import Column, String, Integer, DateTime
from app.models.pet_scan import Base
from datetime import datetime
import uuid

class Pet(Base):
    __tablename__ = "pets"

    id = Column(String, primary_key=True, default=lambda: f"pet_{uuid.uuid4().hex[:8]}")
    pet_name = Column(String, nullable=False)
    pet_type = Column(String, nullable=False) # Dog, Cat, Other
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
