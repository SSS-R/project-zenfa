"""
Advanced stealth scraping utilities for anti-detection
"""

import random
import asyncio
import json
from typing import List, Dict, Optional
from playwright.async_api import Page, BrowserContext
import logging

logger = logging.getLogger(__name__)

class StealthManager:
    """Manages advanced anti-detection techniques"""
    
    def __init__(self):
        self.proxy_pool = []  # Could be populated with proxy servers
        self.request_patterns = self._generate_human_patterns()
        
    def _generate_human_patterns(self) -> List[Dict]:
        """Generate human-like interaction patterns"""
        return [
            {"scroll_probability": 0.3, "click_probability": 0.1, "pause_duration": (1, 3)},
            {"scroll_probability": 0.5, "click_probability": 0.05, "pause_duration": (2, 5)},
            {"scroll_probability": 0.2, "click_probability": 0.15, "pause_duration": (0.5, 2)},
            {"scroll_probability": 0.4, "click_probability": 0.08, "pause_duration": (1.5, 4)},
        ]
    
    async def stealth_navigate(self, page: Page, url: str) -> bool:
        """Navigate to URL with human-like behavior simulation"""
        try:
            # Set random viewport size occasionally
            if random.random() < 0.1:
                width = random.randint(1200, 1920)
                height = random.randint(800, 1080)
                await page.set_viewport_size({"width": width, "height": height})
            
            # Navigate with realistic timing
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            
            # Simulate human reading/scanning time
            await asyncio.sleep(random.uniform(1.5, 4.0))
            
            # Random human-like interactions
            pattern = random.choice(self.request_patterns)
            
            # Simulate scrolling behavior
            if random.random() < pattern["scroll_probability"]:
                await self._simulate_scroll(page)
            
            # Simulate occasional clicks (non-functional)
            if random.random() < pattern["click_probability"]:
                await self._simulate_click(page)
            
            # Add natural pause
            pause = random.uniform(*pattern["pause_duration"])
            await asyncio.sleep(pause)
            
            return True
            
        except Exception as e:
            logger.warning(f"Stealth navigation failed for {url}: {e}")
            return False
    
    async def _simulate_scroll(self, page: Page):
        """Simulate natural scrolling behavior"""
        try:
            # Get page height
            page_height = await page.evaluate("document.body.scrollHeight")
            viewport_height = await page.evaluate("window.innerHeight")
            
            if page_height > viewport_height:
                # Simulate realistic scrolling
                scroll_positions = [
                    random.randint(100, 500),
                    random.randint(200, min(800, page_height // 3)),
                    random.randint(100, min(1200, page_height // 2))
                ]
                
                for pos in scroll_positions[:random.randint(1, 3)]:
                    await page.evaluate(f"window.scrollTo(0, {pos})")
                    await asyncio.sleep(random.uniform(0.3, 1.2))
                
                # Sometimes scroll back up
                if random.random() < 0.3:
                    await page.evaluate("window.scrollTo(0, 0)")
                    await asyncio.sleep(random.uniform(0.2, 0.8))
                    
        except Exception as e:
            logger.debug(f"Scroll simulation failed: {e}")
    
    async def _simulate_click(self, page: Page):
        """Simulate occasional non-functional clicks"""
        try:
            # Find safe elements to click (that won't navigate away)
            safe_selectors = [
                "body", "div", "span", "p", "h1", "h2", "h3", 
                ".content", ".main", ".container", ".wrapper"
            ]
            
            for selector in safe_selectors:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        await element.click()
                        await asyncio.sleep(random.uniform(0.1, 0.5))
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.debug(f"Click simulation failed: {e}")

    def get_random_headers(self) -> Dict[str, str]:
        """Generate randomized headers for requests"""
        base_headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": random.choice([
                "en-US,en;q=0.5",
                "en-US,en;q=0.9",
                "en-GB,en;q=0.8",
            ]),
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
        }
        
        # Occasionally add extra headers
        if random.random() < 0.3:
            base_headers["Cache-Control"] = random.choice(["no-cache", "max-age=0"])
        
        if random.random() < 0.2:
            base_headers["Pragma"] = "no-cache"
            
        return base_headers

class RateLimiter:
    """Intelligent rate limiting to avoid detection"""
    
    def __init__(self):
        self.request_times = []
        self.error_count = 0
        self.last_error_time = 0
        
    def record_request(self, success: bool = True):
        """Record request timing for adaptive rate limiting"""
        current_time = asyncio.get_event_loop().time()
        self.request_times.append(current_time)
        
        # Keep only recent requests (last 10 minutes)
        cutoff_time = current_time - 600
        self.request_times = [t for t in self.request_times if t > cutoff_time]
        
        if not success:
            self.error_count += 1
            self.last_error_time = current_time
    
    def calculate_delay(self, base_delay: float = 2.0) -> float:
        """Calculate intelligent delay based on request history"""
        current_time = asyncio.get_event_loop().time()
        
        # Base delay with randomization
        delay = random.uniform(base_delay * 0.8, base_delay * 1.5)
        
        # Increase delay based on request frequency
        recent_requests = len([t for t in self.request_times if current_time - t < 60])
        if recent_requests > 10:
            delay *= 1.5
        elif recent_requests > 20:
            delay *= 2.0
        
        # Increase delay if recent errors
        if current_time - self.last_error_time < 300:  # Last 5 minutes
            delay *= (1 + self.error_count * 0.5)
        
        # Reset error count if no errors for a while
        if current_time - self.last_error_time > 600:
            self.error_count = max(0, self.error_count - 1)
        
        return min(delay, 30.0)  # Cap at 30 seconds

class SessionRotator:
    """Manages session rotation to avoid fingerprinting"""
    
    def __init__(self, max_requests_per_session: int = 15):
        self.max_requests = max_requests_per_session
        self.current_requests = 0
        
    def should_rotate(self) -> bool:
        """Determine if session should be rotated"""
        self.current_requests += 1
        
        # Rotate after max requests with some randomness
        rotation_threshold = self.max_requests + random.randint(-3, 5)
        return self.current_requests >= rotation_threshold
    
    def reset(self):
        """Reset request counter after rotation"""
        self.current_requests = 0

# Advanced browser configurations for different use cases
BROWSER_CONFIGS = {
    "conservative": {
        "concurrency": 2,
        "delay_range": (3.0, 8.0),
        "pages_per_session": 10,
        "error_backoff": 3.0
    },
    "balanced": {
        "concurrency": 3,
        "delay_range": (1.5, 4.0),
        "pages_per_session": 15,
        "error_backoff": 2.0
    },
    "aggressive": {
        "concurrency": 4,
        "delay_range": (1.0, 2.5),
        "pages_per_session": 20,
        "error_backoff": 1.5
    }
}

def get_config(mode: str = "balanced") -> Dict:
    """Get scraping configuration based on aggressiveness level"""
    return BROWSER_CONFIGS.get(mode, BROWSER_CONFIGS["balanced"])