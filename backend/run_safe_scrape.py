#!/usr/bin/env python3
"""
ENHANCED SAFE SCRAPER RUNNER
Implements multiple safety layers to prevent IP blocking
"""

import asyncio
import logging
import random
import time
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.database import engine
from app.models.enums import ComponentType
from app.scraping.vendors.startech import StarTechScraper
from app.scraping.vendors.skyland import SkylandScraper
from app.services.normalization import NormalizationService
from run_full_scrape import process_vendor_category, STARTECH_URLS, SKYLAND_URLS, get_existing_product_urls

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SafeScraperManager:
    """Manages safe scraping with risk mitigation"""
    
    def __init__(self):
        self.max_daily_requests = 400  # Reduced due to 30-40 products per category
        self.session_request_limit = 100  # Per session limit (reduced)
        self.min_session_break = 1800  # 30 minutes between sessions
        self.daily_reset_hour = 2  # 2 AM daily reset
        
    async def run_safe_scraping_session(self, component_types=None):
        """Run a single safe scraping session with limits"""
        
        if component_types is None:
            # Default: Only scrape 2-3 component types per session for safety
            all_types = [ComponentType.CPU, ComponentType.GPU, ComponentType.RAM, 
                        ComponentType.MOTHERBOARD, ComponentType.STORAGE, 
                        ComponentType.PSU, ComponentType.CASE, ComponentType.COOLER]
            component_types = random.sample(all_types, 3)  # Random 3 components
        
        logger.info(f"🛡️ SAFE SCRAPING SESSION STARTED")
        logger.info(f"📋 Components this session: {[c.value for c in component_types]}")
        
        session = Session(engine)
        normalization = NormalizationService()
        
        # Initialize scrapers with enhanced stealth
        startech = StarTechScraper(headless=True)
        skyland = SkylandScraper(headless=True)
        
        total_requests = 0
        session_start = time.time()
        
        try:
            for component_type in component_types:
                logger.info(f"\n🎯 Processing {component_type.value.upper()}")
                
                # Check session limits
                if total_requests >= self.session_request_limit:
                    logger.warning(f"⚠️ Session request limit ({self.session_request_limit}) reached")
                    break
                
                # Process StarTech with monitoring
                logger.info(f"🔄 StarTech {component_type.value}")
                pre_startech_requests = startech.request_count
                startech_count = await process_vendor_category(
                    startech, STARTECH_URLS, component_type, normalization, session
                )
                startech_requests_made = startech.request_count - pre_startech_requests
                total_requests += startech_requests_made
                logger.info(f"📊 StarTech: {startech_count} products, {startech_requests_made} HTTP requests")
                
                # Inter-vendor break - CRITICAL for safety
                break_time = random.uniform(60, 120)  # 1-2 minute break
                logger.info(f"⏱️ Inter-vendor break: {break_time:.1f}s")
                await asyncio.sleep(break_time)
                
                # Check limits again
                if total_requests >= self.session_request_limit:
                    logger.warning(f"⚠️ Session request limit reached after StarTech")
                    break
                
                # Process Skyland with monitoring
                logger.info(f"🔄 Skyland {component_type.value}")
                pre_skyland_requests = skyland.request_count
                skyland_count = await process_vendor_category(
                    skyland, SKYLAND_URLS, component_type, normalization, session
                )
                skyland_requests_made = skyland.request_count - pre_skyland_requests
                total_requests += skyland_requests_made
                logger.info(f"📊 Skyland: {skyland_count} products, {skyland_requests_made} HTTP requests")
                
                # Inter-component break - CRITICAL for safety
                if component_type != component_types[-1]:  # Don't wait after last component
                    break_time = random.uniform(180, 300)  # 3-5 minute break
                    logger.info(f"⏱️ Inter-component break: {break_time:.1f}s")
                    await asyncio.sleep(break_time)
                
        except Exception as e:
            logger.error(f"❌ Session error: {e}")
        
        finally:
            await startech.cleanup()
            await skyland.cleanup()
            session.close()
        
        session_duration = time.time() - session_start
        logger.info(f"\n✅ SAFE SESSION COMPLETED")
        logger.info(f"⏱️ Duration: {session_duration/60:.1f} minutes")
        logger.info(f"📊 Estimated requests: {total_requests}")
        logger.info(f"🛡️ Session safety: MAINTAINED")
        
        return total_requests

    async def run_daily_safe_scraping(self):
        """Run multiple safe sessions throughout the day"""
        logger.info(f"🌅 STARTING DAILY SAFE SCRAPING ROUTINE")
        
        # Run 2-3 sessions per day max
        sessions_today = 0
        max_sessions = 2
        total_daily_requests = 0
        
        while sessions_today < max_sessions and total_daily_requests < self.max_daily_requests:
            session_requests = await self.run_safe_scraping_session()
            sessions_today += 1
            total_daily_requests += session_requests
            
            if sessions_today < max_sessions and total_daily_requests < self.max_daily_requests:
                # Long break between sessions
                break_duration = random.uniform(self.min_session_break, self.min_session_break + 900)
                logger.info(f"💤 LONG BREAK BETWEEN SESSIONS: {break_duration/60:.1f} minutes")
                await asyncio.sleep(break_duration)
        
        logger.info(f"\n🌅 DAILY SCRAPING COMPLETED")
        logger.info(f"📊 Total sessions: {sessions_today}")
        logger.info(f"📊 Total estimated requests: {total_daily_requests}")
        logger.info(f"🛡️ Safety status: {'✅ SAFE' if total_daily_requests < self.max_daily_requests else '⚠️ LIMIT REACHED'}")

async def run_specific_components(components):
    """Run scraper for specific components only"""
    component_map = {
        'cpu': ComponentType.CPU,
        'gpu': ComponentType.GPU, 
        'ram': ComponentType.RAM,
        'motherboard': ComponentType.MOTHERBOARD,
        'storage': ComponentType.STORAGE,
        'psu': ComponentType.PSU,
        'case': ComponentType.CASE,
        'cooler': ComponentType.COOLER
    }
    
    component_types = [component_map[c.lower()] for c in components if c.lower() in component_map]
    
    if not component_types:
        logger.error("❌ No valid components specified")
        return
    
    manager = SafeScraperManager()
    await manager.run_safe_scraping_session(component_types)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Run specific components
        components = sys.argv[1:]
        logger.info(f"🎯 Running scraper for specific components: {components}")
        asyncio.run(run_specific_components(components))
    else:
        # Run full daily routine
        manager = SafeScraperManager()
        asyncio.run(manager.run_daily_safe_scraping())