from pydantic import BaseModel
from typing import List, Optional, Any

class PetDetails(BaseModel):
    name: str
    age: str
    gender: str
    breed: str

class DiseaseAnalysis(BaseModel):
    disease_name: str
    severity: str
    symptoms: List[str]
    precautions: List[str]
    home_care: List[str]
    vet_treatment: List[str]

class PetScanResponse(BaseModel):
    scan_id: str
    is_valid_pet: bool
    is_healthy: bool
    pet_details: PetDetails
    disease_analysis: Optional[DiseaseAnalysis] = None
    original_image_url: str
    bbox_url: Optional[str] = None
    kb_suggestions: List[str] = []
    disclaimer: str = "Consult a certified veterinarian for final diagnosis."
