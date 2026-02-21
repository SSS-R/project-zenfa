#!/usr/bin/env python3
"""
Test script for the optimized scraper
"""

import asyncio
import logging
from app.scraping.vendors.startech import StarTechScraper
from app.scraping.monitor import ScraperMonitor, RequestMetrics
from app.scraping.config import get_config
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_scraper():
    """Test the optimized scraper"""
    logger.info("Starting scraper test...")
    
    # Initialize components
    config = get_config("balanced")
    monitor = ScraperMonitor("test_metrics.jsonl")
    scraper = StarTechScraper(headless=True)
    
    # Test URL
    test_url = "https://www.startech.com.bd/component/processor"
    
    try:
        # Test page fetching
        logger.info(f"Testing page fetch: {test_url}")
        start_time = time.time()
        
        html = await scraper.fetch_page(test_url)
        duration = time.time() - start_time
        
        # Record metrics
        metrics = RequestMetrics(
            url=test_url,
            vendor="StarTech",
            component_type="CPU",
            timestamp=time.time(),
            duration=duration,
            success=html is not None,
            content_length=len(html) if html else 0,
            error=None if html else "Failed to fetch page"
        )
        
        monitor.record_request(metrics)
        
        if html:
            logger.info(f"✅ Successfully fetched page ({len(html)} chars) in {duration:.2f}s")
            
            # Test product URL extraction
            product_urls = scraper.extract_product_urls(html)
            logger.info(f"✅ Extracted {len(product_urls)} product URLs")
            
            # Test a few product pages
            if product_urls:
                logger.info("Testing product page scraping...")
                for i, product_url in enumerate(product_urls[:3]):  # Test first 3
                    try:
                        start_time = time.time()
                        product_html = await scraper.fetch_page(product_url)
                        duration = time.time() - start_time
                        
                        if product_html:
                            scraped_product = await scraper.parse_product(product_html, product_url)
                            success = scraped_product is not None
                            
                            metrics = RequestMetrics(
                                url=product_url,
                                vendor="StarTech",
                                component_type="CPU",
                                timestamp=time.time(),
                                duration=duration,
                                success=success,
                                content_length=len(product_html),
                                error=None if success else "Failed to parse product"
                            )
                            
                            monitor.record_request(metrics)
                            
                            if scraped_product:
                                logger.info(f"✅ Product {i+1}: {scraped_product.name} - ৳{scraped_product.price}")
                            else:
                                logger.warning(f"⚠️ Product {i+1}: Failed to parse")
                        else:
                            logger.warning(f"⚠️ Product {i+1}: Failed to fetch")
                            
                    except Exception as e:
                        logger.error(f"❌ Product {i+1}: Error - {e}")
                        
        else:
            logger.error("❌ Failed to fetch test page")
            
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        
    finally:
        # Cleanup
        await scraper.cleanup()
        
        # Show performance summary
        logger.info("\\n" + "="*50)
        logger.info("PERFORMANCE SUMMARY")
        logger.info("="*50)
        
        summary = monitor.get_summary()
        logger.info(f"Total Requests: {summary['total_requests']}")
        logger.info(f"Success Rate: {summary['success_rate']:.1%}")
        logger.info(f"Block Rate: {summary['block_rate']:.1%}")
        logger.info(f"Avg Request Time: {summary['avg_request_time']:.2f}s")
        logger.info(f"Requests/Min: {summary['requests_per_minute']:.1f}")
        
        # Check for issues
        issues = monitor.detect_blocking_patterns()
        if issues['alerts']:
            logger.warning("\\n⚠️  DETECTED ISSUES:")
            for alert in issues['alerts']:
                logger.warning(f"  {alert['severity'].upper()}: {alert['message']}")
                
            logger.info("\\n💡 RECOMMENDATIONS:")
            for rec in issues['recommendations']:
                logger.info(f"  • {rec}")
        else:
            logger.info("\\n✅ No blocking issues detected")

if __name__ == "__main__":
    asyncio.run(test_scraper())