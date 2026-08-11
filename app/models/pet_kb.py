from sqlalchemy import Column, Integer, Text
from app.models.pet_scan import Base

class PetKB(Base):
    """
    SQL to create manually if not using migrations:
    CREATE TABLE IF NOT EXISTS pet_kb (
        id SERIAL PRIMARY KEY, 
        pet_name TEXT NOT NULL, 
        disease_name TEXT NOT NULL, 
        treatment TEXT NOT NULL
    );
    """
    __tablename__ = "pet_kb"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pet_name = Column(Text, nullable=False)
    disease_name = Column(Text, nullable=False)
    treatment = Column(Text, nullable=False)
