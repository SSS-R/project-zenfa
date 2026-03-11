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
    # Minimum fuzzy score to even consider a match (raised from 75 → 88 for safety)
    MATCH_THRESHOLD = 88

    def _get_candidates(self, session: Session, component_type: ComponentType) -> List[Any]:
        return session.exec(select(Component).where(Component.component_type == component_type)).all()

    def normalize_product(self, session: Session, scraped_data: ScrapedProduct, component_type: ComponentType) -> Optional[int]:
        """
        Attempts to match a scraped product to an existing DB component.
        Returns the Component ID if a confident match is found, else None.
        """
        candidates = self._get_candidates(session, component_type)
        if not candidates:
            return None

        # Fuzzy match the product name against all DB candidates
        choices = {c.id: c.name for c in candidates}

        result = process.extractOne(
            scraped_data.name,
            choices,
            scorer=fuzz.token_sort_ratio
        )

        # extractOne with dict returns (match_string, score, key)
        if not result:
            return None

        _, score, best_match_id = result

        if score < self.MATCH_THRESHOLD:
            return None

        component_obj = next((c for c in candidates if c.id == best_match_id), None)
        if not component_obj:
            return None

        # Component-specific validation to prevent false positives
        if not self._validate_match(scraped_data, component_obj, component_type):
            return None

        return component_obj.id

    def _validate_match(self, scraped: ScrapedProduct, component_item: Component, component_type: ComponentType) -> bool:
        """
        Returns True only if the match holds up against component-specific rules.
        Prevents false positives like matching a B450 to a Z790 motherboard.
        """
        name_scraped = scraped.name.lower()
        name_db = component_item.name.lower()

        if component_type == ComponentType.CPU:
            # Model number must match exactly (e.g. 5600G vs 5600X are different)
            model_pattern = r"(\d{4,5}[a-z]*)"
            scraped_model = re.search(model_pattern, name_scraped)
            db_model = re.search(model_pattern, name_db)
            if scraped_model and db_model:
                if scraped_model.group(1) != db_model.group(1):
                    return False
            return True

        elif component_type == ComponentType.GPU:
            # Ti/Super/XT suffix must agree
            for suffix in ["ti", "super", "xt", "xtx"]:
                scraped_has = suffix in name_scraped
                db_has = suffix in name_db
                if scraped_has != db_has:
                    return False

            # Chipset model number must match (e.g. 3060 vs 4060 are different)
            model_pattern = r"(\d{4})"
            scraped_model = re.search(model_pattern, name_scraped)
            db_model = re.search(model_pattern, name_db)
            if scraped_model and db_model:
                if scraped_model.group(1) != db_model.group(1):
                    return False
            return True

        elif component_type == ComponentType.RAM:
            # DDR generation must match
            for gen in ["ddr4", "ddr5", "ddr3"]:
                scraped_has = gen in name_scraped
                db_has = gen in name_db
                if scraped_has != db_has:
                    return False

            # Capacity must match (8GB vs 16GB are different)
            cap_pattern = r"(\d+)\s*gb"
            scraped_cap = re.search(cap_pattern, name_scraped)
            db_cap = re.search(cap_pattern, name_db)
            if scraped_cap and db_cap:
                if scraped_cap.group(1) != db_cap.group(1):
                    return False
            return True

        elif component_type == ComponentType.MOTHERBOARD:
            # Chipset code must match (e.g. B450, H610, Z790, X570)
            # These follow the pattern: letter(s) + 3-4 digits
            chipset_pattern = r"\b([a-z]{1,2}\d{3,4})\b"
            scraped_chipset = re.search(chipset_pattern, name_scraped)
            db_chipset = re.search(chipset_pattern, name_db)
            if scraped_chipset and db_chipset:
                if scraped_chipset.group(1) != db_chipset.group(1):
                    return False
            return True

        elif component_type == ComponentType.STORAGE:
            # Capacity must match (500GB, 1TB, 2TB must agree)
            tb_pattern = r"(\d+)\s*tb"
            gb_pattern = r"(\d+)\s*gb"
            scraped_tb = re.search(tb_pattern, name_scraped)
            db_tb = re.search(tb_pattern, name_db)
            scraped_gb = re.search(gb_pattern, name_scraped)
            db_gb = re.search(gb_pattern, name_db)

            # If one has TB and the other only GB, they're different (unless same amount)
            if scraped_tb and db_tb:
                if scraped_tb.group(1) != db_tb.group(1):
                    return False
            elif scraped_gb and db_gb:
                if scraped_gb.group(1) != db_gb.group(1):
                    return False

            # SSD vs HDD must agree
            scraped_is_ssd = "ssd" in name_scraped or "nvme" in name_scraped or "m.2" in name_scraped
            db_is_ssd = "ssd" in name_db or "nvme" in name_db or "m.2" in name_db
            scraped_is_hdd = "hdd" in name_scraped or "hard disk" in name_scraped or "hard drive" in name_scraped
            db_is_hdd = "hdd" in name_db or "hard disk" in name_db or "hard drive" in name_db

            if scraped_is_ssd and db_is_hdd:
                return False
            if scraped_is_hdd and db_is_ssd:
                return False

            return True

        elif component_type == ComponentType.PSU:
            # Wattage must match (e.g. 550W vs 650W are different)
            watt_pattern = r"(\d+)\s*w\b"
            scraped_w = re.search(watt_pattern, name_scraped)
            db_w = re.search(watt_pattern, name_db)
            if scraped_w and db_w:
                if scraped_w.group(1) != db_w.group(1):
                    return False
            return True

        elif component_type == ComponentType.COOLER:
            # Model numbers if present must match
            model_pattern = r"(\d{3,5})"
            scraped_model = re.search(model_pattern, name_scraped)
            db_model = re.search(model_pattern, name_db)
            if scraped_model and db_model:
                if scraped_model.group(1) != db_model.group(1):
                    return False
            return True

        elif component_type == ComponentType.CASE:
            # Cases rarely share names — fuzzy score alone is enough at 75+
            return True

        # Default: trust the fuzzy score
        return True
