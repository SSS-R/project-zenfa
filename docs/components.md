# StarTech Component List & Gap Analysis

This document lists the hardware categories found on [StarTech](https://www.startech.com.bd/) and compares them with our current database schema to identify missing models.

## 1. Core PC Components (The "Builder" Parts)

| Component Category | StarTech Availability | Current DB Model | Status |
| :--- | :---: | :---: | :--- |
| **Processor** | ✅ | `CPU` | ✅ Covered |
| **Motherboard** | ✅ | `Motherboard` | ✅ Covered |
| **Graphics Card** | ✅ | `GPU` | ✅ Covered |
| **RAM (Desktop)** | ✅ | `RAM` | ✅ Covered |
| **RAM (Laptop)** | ✅ | `RAM` | ⚠️ Partially (Need to distinguish SODIMM?) |
| **SSD** | ✅ | `Storage` | ✅ Covered |
| **Hard Disk Drive** | ✅ | `Storage` | ✅ Covered |
| **Power Supply** | ✅ | `PSU` | ✅ Covered |
| **Casing (Chassis)** | ✅ | `Casing` | ✅ Covered |
| **CPU Cooler (Air)** | ✅ | `CPUCooler` | ✅ Covered |
| **Liquid Cooling** | ✅ | `CPUCooler` | ✅ Covered |
| **Casing Cooler (Fans)** | ✅ | `CaseFan` | ✅ Covered |
| **Optical Drive** | ✅ | ❌ | **MISSING** (Low Priority) |
| **Thermal Paste** | ✅ | ❌ | **MISSING** (Low Priority) |

## 2. Peripherals & Accessories (The "Setup" Parts)

| Component Category | StarTech Availability | Current DB Model | Status |
| :--- | :---: | :---: | :--- |
| **Monitor** | ✅ | `Monitor` | ✅ Covered |
| **Keyboard** | ✅ | `Peripheral` | ✅ Covered |
| **Mouse** | ✅ | `Peripheral` | ✅ Covered |
| **Headphone / Headset** | ✅ | `Peripheral` | ✅ Covered |
| **Mouse Pad** | ✅ | ❌ | **MISSING** |
| **UPS** | ✅ | `Peripheral` | ✅ Covered |
| **Webcam** | ✅ | ❌ | **MISSING** |
| **Speaker** | ✅ | ❌ | **MISSING** |

## 3. Systems (Pre-built & Mobile)

| Category | StarTech Availability | Current DB Model | Status |
| :--- | :---: | :---: | :--- |
| **Laptop** | ✅ | `Laptop` | ✅ Covered |
| **Desktop PC (Brand)** | ✅ | ❌ | **MISSING** |
| **All-in-One PC** | ✅ | ❌ | **MISSING** |

---

## 🛑 Gap Analysis Summary

To fully support "taking every data" from StarTech as requested, we are missing functionality for the following major categories:

1.  **Cooling**: CPU Coolers (Air/Liquid) and Case Fans. Essential for high-end builds.
2.  **Casing**: The actual PC case. Essential for checking GPU length compatibility and motherboard form factor fit.
3.  **Monitors**: A critical part of the budget for many users.
4.  **Accessories**: Keyboards, Mice, etc. (Maybe lower priority for the "Builder" logic but needed for the "Aggregator").
5.  **Laptops**: A completely separate product line from PC building but a huge market.

### Recommendation
Before building the scraper engine, we should at least implement models for **Casing** and **Coolers** (Air/Liquid) as they are strictly required for validation (Physical dimensions, TDP cooling capacity). Monitors and Laptops can be added now or later depending on scope.
