"""
Compatibility Service for PC Component Matching.

Defines rules for checking if PC components are compatible with each other.
"""

from typing import List, Tuple
from dataclasses import dataclass

from ..models.component import CPU, Motherboard, RAM


@dataclass
class CompatibilityResult:
    """Result of a compatibility check."""
    compatible: bool
    reason: str = ""
    warnings: List[str] = None
    
    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []


def check_cpu_motherboard(cpu: CPU, motherboard: Motherboard) -> CompatibilityResult:
    """
    Check if a CPU is compatible with a motherboard.
    
    Rules:
    - Socket types must match (AM5 CPU → AM5 motherboard)
    """
    if cpu.socket != motherboard.socket:
        return CompatibilityResult(
            compatible=False,
            reason=f"Socket mismatch: CPU uses {cpu.socket.value}, "
                   f"but motherboard has {motherboard.socket.value} socket"
        )
    
    return CompatibilityResult(
        compatible=True,
        reason=f"CPU socket {cpu.socket.value} matches motherboard"
    )


def check_ram_motherboard(ram: RAM, motherboard: Motherboard) -> CompatibilityResult:
    """
    Check if RAM is compatible with a motherboard.
    
    Rules:
    - RAM type must match (DDR5 RAM → DDR5 motherboard)
    - Total RAM shouldn't exceed motherboard max
    """
    warnings = []
    
    # Check DDR type
    if ram.ram_type != motherboard.ram_type:
        return CompatibilityResult(
            compatible=False,
            reason=f"RAM type mismatch: RAM is {ram.ram_type.value}, "
                   f"but motherboard supports {motherboard.ram_type.value}"
        )
    
    # Check capacity
    total_ram = ram.capacity_gb * ram.modules
    if total_ram > motherboard.max_ram_gb:
        return CompatibilityResult(
            compatible=False,
            reason=f"RAM capacity ({total_ram}GB) exceeds motherboard maximum ({motherboard.max_ram_gb}GB)"
        )
    
    # Check module count
    if ram.modules > motherboard.ram_slots:
        return CompatibilityResult(
            compatible=False,
            reason=f"RAM kit has {ram.modules} modules, but motherboard only has {motherboard.ram_slots} slots"
        )
    
    # Warnings (compatible but not optimal)
    if ram.modules < motherboard.ram_slots and ram.modules % 2 != 0:
        warnings.append("Single-channel RAM configuration detected. Consider dual-channel for better performance.")
    
    return CompatibilityResult(
        compatible=True,
        reason=f"RAM {ram.ram_type.value} compatible with motherboard",
        warnings=warnings
    )


class CompatibilityService:
    """
    Service for comprehensive build compatibility checking.
    """
    
    @staticmethod
    def check_build(
        cpu: CPU,
        motherboard: Motherboard,
        ram: RAM
    ) -> Tuple[bool, List[CompatibilityResult]]:
        """
        Check full build compatibility.
        
        Returns:
            Tuple of (is_compatible, list of compatibility results)
        """
        results = []
        
        # CPU + Motherboard
        cpu_mb_result = check_cpu_motherboard(cpu, motherboard)
        results.append(cpu_mb_result)
        
        # RAM + Motherboard
        ram_mb_result = check_ram_motherboard(ram, motherboard)
        results.append(ram_mb_result)
        
        # Overall compatibility
        is_compatible = all(r.compatible for r in results)
        
        return is_compatible, results
