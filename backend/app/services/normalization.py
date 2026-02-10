import re
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from thefuzz import fuzz, process
from ..models.component import Component
from ..models.cpu import CPU
from ..models.gpu import GPU
from ..models.ram import RAM
from ..models.enums import ComponentType
from ..scraping.schemas import ScrapedProduct

class NormalizationService:
    def _get_candidates(self, session: Session, component_type: ComponentType) -> List[Component]:
        # We need to return the *CPUs* (or valid subtype) but we need their names from Component
        # Actually simplest way: Query Component where type matches
        # Then we can access subtypes if needed for validation
         
        # But wait, validation logic expects 'candidate' to be the subtype (CPU/RAM) to check specific fields
        # So we should query the Subtype and join Component to get the name
        
        if component_type == ComponentType.CPU:
            return session.exec(select(CPU, Component).join(Component)).all()
        elif component_type == ComponentType.GPU:
             return session.exec(select(GPU, Component).join(Component)).all()
        elif component_type == ComponentType.RAM:
             return session.exec(select(RAM, Component).join(Component)).all()
        
        return []

    def normalize_product(self, session: Session, scraped_data: ScrapedProduct, component_type: ComponentType) -> Optional[int]:
        """
        Attempts to match a scraped product to a database product ID.
        Returns the Component ID if a confident match is found, else None.
        """
        
        # 1. Fetch all candidates from DB for this component type
        # Results will be list of (Subtype, Component) tuples
        candidates = self._get_candidates(session, component_type)
        if not candidates:
            return None
            
        # 2. Fuzzy Match Name
        # candidate[1] is the Component object which has the name
        choices = {c[1].id: c[1].name for c in candidates}
        
        result = process.extractOne(
            scraped_data.name, 
            choices, 
            scorer=fuzz.token_sort_ratio
        )
        
        # extractOne with dict returns (match_string, score, key)
        if not result:
            return None
            
        _, score, best_match_id = result
        
        # Threshold for initial consideration
        if score < 70:
            return None

        # Find the full tuple (Subtype, Component) for the matched ID
        candidate_tuple = next((c for c in candidates if c[1].id == best_match_id), None)
        if not candidate_tuple:
            return None
            
        subtype_obj, component_obj = candidate_tuple

        # 3. Component-Specific Validation (The "Careful" Part)
        if not self._validate_match(scraped_data, subtype_obj, component_obj, component_type):
            return None

        return component_obj.id

    def _validate_match(self, scraped: ScrapedProduct, subtype_item: Any, component_item: Component, component_type: ComponentType) -> bool:
        """
        Returns True if the match holds up against specific rules.
        """
        name_scraped = scraped.name.lower()
        name_db = component_item.name.lower()

        if component_type == ComponentType.CPU:
            # Rule 1: Model Number Matching (e.g. 5600G vs 5600X)
            # Extract numbers like 5600, 12400, etc.
            model_pattern = r"(\d{4,5}[a-z]*)"
            scraped_model = re.search(model_pattern, name_scraped)
            db_model = re.search(model_pattern, name_db)
            
            if scraped_model and db_model:
                if scraped_model.group(1) != db_model.group(1):
                    return False
            
            return True

        elif component_type == ComponentType.RAM:
            # Rule 1: DDR Type (DDR4 vs DDR5)
            if "ddr4" in name_scraped and "ddr5" in name_db:
                return False
            if "ddr5" in name_scraped and "ddr4" in name_db:
                return False
            
            # Rule 2: Capacity (8GB vs 16GB) - simple check
            cap_pattern = r"(\d+)gb"
            scraped_cap = re.search(cap_pattern, name_scraped)
            db_cap = re.search(cap_pattern, name_db)
            
            if scraped_cap and db_cap:
                if scraped_cap.group(1) != db_cap.group(1):
                    return False

            return True
            
        elif component_type == ComponentType.GPU:
            # Rule 1: Chipset (3060 vs 3060 Ti)
            # Logic: If 'Ti' is in one but not other -> Fail
            if "ti" in name_scraped and "ti" not in name_db:
                return False
            if "ti" not in name_scraped and "ti" in name_db:
                return False
                
            return True

        return True
