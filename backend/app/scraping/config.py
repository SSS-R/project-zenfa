"""
Configuration for the optimized scraper
"""

# Scraping Configuration
SCRAPER_CONFIG = {
    "mode": "balanced",  # conservative, balanced, aggressive
    
    # Concurrency Settings
    "max_concurrent_requests": 3,
    "max_pages_per_category": 5,  # Reduced from 7 for stealth
    "batch_size": 15,
    
    # Timing Settings (in seconds)
    "base_delay_range": (1.5, 4.0),
    "page_delay_range": (4, 8),
    "vendor_delay_range": (8, 15),
    "category_delay_range": (10, 20),
    "error_backoff_multiplier": 2.0,
    
    # Browser Settings
    "headless": True,
    "max_requests_per_session": 15,
    "context_rotation_frequency": (10, 15),
    
    # Error Handling
    "max_retries": 1,
    "error_threshold": 0.3,  # 30% error rate triggers slowdown
    "high_error_delay": (8, 15),
    
    # Memory Management
    "gc_frequency": 2,  # Run GC every 2 batches
    
    # Detection Avoidance
    "human_behavior_simulation": True,
    "scroll_probability": 0.3,
    "click_probability": 0.1,
    "session_rotation": True,
    "randomize_order": True,
}

# Browser Fingerprint Variations
BROWSER_FINGERPRINTS = [
    {
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "viewport": {"width": 1920, "height": 1080},
        "platform": "Win32"
    },
    {
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "viewport": {"width": 1440, "height": 900},
        "platform": "MacIntel"
    },
    {
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "viewport": {"width": 1366, "height": 768},
        "platform": "Win32"
    },
    {
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
        "viewport": {"width": 1536, "height": 864},
        "platform": "MacIntel"
    },
    {
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "viewport": {"width": 1280, "height": 720},
        "platform": "Linux x86_64"
    }
]

# Mode-specific overrides
MODE_CONFIGS = {
    "conservative": {
        "max_concurrent_requests": 2,
        "max_pages_per_category": 3,
        "base_delay_range": (3.0, 8.0),
        "vendor_delay_range": (15, 25),
        "category_delay_range": (20, 30),
    },
    
    "balanced": {
        "max_concurrent_requests": 3,
        "max_pages_per_category": 5,
        "base_delay_range": (1.5, 4.0),
        "vendor_delay_range": (8, 15),
        "category_delay_range": (10, 20),
    },
    
    "aggressive": {
        "max_concurrent_requests": 4,
        "max_pages_per_category": 7,
        "base_delay_range": (1.0, 2.5),
        "vendor_delay_range": (5, 10),
        "category_delay_range": (8, 15),
    }
}

def get_config(mode: str = None) -> dict:
    """Get scraper configuration for specified mode"""
    config = SCRAPER_CONFIG.copy()
    
    if mode and mode in MODE_CONFIGS:
        config.update(MODE_CONFIGS[mode])
    elif config.get("mode") in MODE_CONFIGS:
        config.update(MODE_CONFIGS[config["mode"]])
    
    return config