import pandas as pd
import os
import logging
from typing import List

logger = logging.getLogger(__name__)

class KnowledgeBaseService:
    def __init__(self, csv_path: str = "knowledge_base/pet_kb.csv"):
        self.csv_path = csv_path
        self.df = None
        self._load_kb()

    def _load_kb(self):
        try:
            if os.path.exists(self.csv_path):
                self.df = pd.read_csv(self.csv_path)
            else:
                logger.warning(f"KB CSV not found at {self.csv_path}")
                self.df = pd.DataFrame(columns=["pet_type", "disease_name", "additional_guidance"])
        except Exception as e:
            logger.error(f"Error loading KB: {e}")
            self.df = pd.DataFrame(columns=["pet_type", "disease_name", "additional_guidance"])

    def get_suggestions(self, pet_type: str, disease_name: str) -> List[str]:
        if self.df is None or self.df.empty:
            return []
        
        # Simple fuzzy match or exact match
        matches = self.df[
            (self.df['pet_type'].str.contains(pet_type, case=False, na=False)) & 
            (self.df['disease_name'].str.contains(disease_name, case=False, na=False))
        ]
        
        return matches['additional_guidance'].tolist()

kb_service = KnowledgeBaseService()
