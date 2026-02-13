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
    def _get_candidates(self, session: Session, component_type: ComponentType) -> List[Any]:
        # Return list of Components directly, as we might not have subtype records yet
        return session.exec(select(Component).where(Component.component_type == component_type)).all()

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
        choices = {c.id: c.name for c in candidates}
        
        result = process.extractOne(
            scraped_data.name, 
            choices, 
            scorer=fuzz.token_set_ratio
        )
        
        # extractOne with dict returns (match_string, score, key)
        if not result:
            return None
            
        _, score, best_match_id = result
        
        # Threshold for initial consideration
        if score < 70:
            return None

        # Find the component object
        component_obj = next((c for c in candidates if c.id == best_match_id), None)
        if not component_obj:
            return None
            
        subtype_obj = None # We don't have this anymore in the tuple

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
