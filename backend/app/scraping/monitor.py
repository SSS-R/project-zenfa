"""
Monitoring and analytics for the scraper to detect blocking and performance issues
"""

import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class RequestMetrics:
    """Individual request metrics"""
    url: str
    vendor: str
    component_type: str
    timestamp: float
    duration: float
    success: bool
    status_code: Optional[int] = None
    error: Optional[str] = None
    content_length: Optional[int] = None

@dataclass
class SessionMetrics:
    """Session-level metrics"""
    session_start: float
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    blocked_requests: int = 0
    total_duration: float = 0.0
    avg_delay: float = 0.0
    
    @property
    def success_rate(self) -> float:
        return (self.successful_requests / self.total_requests) if self.total_requests > 0 else 0.0
    
    @property
    def failure_rate(self) -> float:
        return (self.failed_requests / self.total_requests) if self.total_requests > 0 else 0.0
    
    @property
    def block_rate(self) -> float:
        return (self.blocked_requests / self.total_requests) if self.total_requests > 0 else 0.0

class ScraperMonitor:
    """Monitor scraper performance and detect blocking patterns"""
    
    def __init__(self, log_file: str = "scraper_metrics.jsonl"):
        self.log_file = log_file
        self.session_metrics = SessionMetrics(session_start=time.time())
        self.request_history: List[RequestMetrics] = []
        self.blocking_indicators = {
            # Common HTTP status codes that indicate blocking
            "blocked_status_codes": [403, 429, 503, 999],
            # Response times that might indicate rate limiting
            "suspicious_response_times": (0.01, 0.1),  # Too fast (cached block) or specific ranges
            # Content patterns that might indicate blocking
            "blocked_content_patterns": [
                "access denied", "rate limited", "too many requests",
                "blocked", "captcha", "cloudflare", "verification",
                "please wait", "retry after"
            ]
        }
    
    def record_request(self, metrics: RequestMetrics):
        """Record metrics for a single request"""
        self.request_history.append(metrics)
        self.session_metrics.total_requests += 1
        self.session_metrics.total_duration += metrics.duration
        
        if metrics.success:
            self.session_metrics.successful_requests += 1
        else:
            self.session_metrics.failed_requests += 1
            
            # Check if this looks like blocking
            if self._is_likely_blocked(metrics):
                self.session_metrics.blocked_requests += 1
                logger.warning(f"Potential blocking detected: {metrics.url} - {metrics.error}")
        
        # Log to file
        self._log_to_file(metrics)
        
        # Cleanup old metrics (keep last 1000)
        if len(self.request_history) > 1000:
            self.request_history = self.request_history[-1000:]
    
    def _is_likely_blocked(self, metrics: RequestMetrics) -> bool:
        """Determine if a request failure indicates blocking"""
        # Check status code
        if metrics.status_code in self.blocking_indicators["blocked_status_codes"]:
            return True
        
        # Check response time patterns
        if metrics.duration:
            min_time, max_time = self.blocking_indicators["suspicious_response_times"]
            if min_time <= metrics.duration <= max_time:
                return True
        
        # Check error message for blocking keywords
        if metrics.error:
            error_lower = metrics.error.lower()
            for pattern in self.blocking_indicators["blocked_content_patterns"]:
                if pattern in error_lower:
                    return True
        
        return False
    
    def get_recent_performance(self, minutes: int = 10) -> Dict:
        """Get performance metrics for recent time period"""
        cutoff_time = time.time() - (minutes * 60)
        recent_requests = [r for r in self.request_history if r.timestamp > cutoff_time]
        
        if not recent_requests:
            return {"period": f"{minutes}m", "requests": 0}
        
        total = len(recent_requests)
        successful = sum(1 for r in recent_requests if r.success)
        failed = total - successful
        blocked = sum(1 for r in recent_requests if not r.success and self._is_likely_blocked(r))
        
        avg_duration = sum(r.duration for r in recent_requests) / total
        
        return {
            "period": f"{minutes}m",
            "requests": total,
            "success_rate": successful / total,
            "failure_rate": failed / total,
            "block_rate": blocked / total,
            "avg_response_time": avg_duration,
            "requests_per_minute": total / minutes
        }
    
    def detect_blocking_patterns(self) -> Dict[str, any]:
        """Analyze patterns that might indicate blocking"""
        recent_5min = self.get_recent_performance(5)
        recent_10min = self.get_recent_performance(10)
        recent_30min = self.get_recent_performance(30)
        
        alerts = []
        
        # High failure rate
        if recent_5min["failure_rate"] > 0.5:
            alerts.append({
                "type": "high_failure_rate",
                "severity": "high",
                "message": f"Failure rate: {recent_5min['failure_rate']:.1%} in last 5 minutes"
            })
        
        # High block rate
        if recent_5min["block_rate"] > 0.3:
            alerts.append({
                "type": "high_block_rate",
                "severity": "critical",
                "message": f"Block rate: {recent_5min['block_rate']:.1%} in last 5 minutes"
            })
        
        # Declining performance
        if (recent_5min["success_rate"] < recent_30min["success_rate"] * 0.7 and 
            recent_5min["requests"] > 5):
            alerts.append({
                "type": "declining_performance",
                "severity": "medium",
                "message": "Success rate declining compared to 30-min average"
            })
        
        # Too fast request rate (might trigger limits)
        if recent_5min["requests_per_minute"] > 20:
            alerts.append({
                "type": "high_request_rate",
                "severity": "medium",
                "message": f"Request rate: {recent_5min['requests_per_minute']:.1f}/min"
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "alerts": alerts,
            "performance": {
                "5min": recent_5min,
                "10min": recent_10min,
                "30min": recent_30min
            },
            "session_totals": asdict(self.session_metrics),
            "recommendations": self._get_recommendations(alerts)
        }
    
    def _get_recommendations(self, alerts: List[Dict]) -> List[str]:
        """Get recommendations based on detected issues"""
        recommendations = []
        
        alert_types = {alert["type"] for alert in alerts}
        
        if "high_block_rate" in alert_types:
            recommendations.extend([
                "Switch to conservative mode",
                "Increase delays between requests",
                "Rotate browser contexts more frequently",
                "Consider using proxy rotation"
            ])
        
        if "high_failure_rate" in alert_types:
            recommendations.extend([
                "Check internet connection",
                "Verify target websites are accessible",
                "Increase request timeouts"
            ])
        
        if "high_request_rate" in alert_types:
            recommendations.extend([
                "Reduce concurrency",
                "Increase base delays",
                "Implement longer pauses between batches"
            ])
        
        if "declining_performance" in alert_types:
            recommendations.extend([
                "Monitor for gradual blocking",
                "Consider taking a break",
                "Rotate to different IP/session"
            ])
        
        return list(set(recommendations))  # Remove duplicates
    
    def _log_to_file(self, metrics: RequestMetrics):
        """Log metrics to file for analysis"""
        try:
            with open(self.log_file, "a") as f:
                log_entry = {
                    "timestamp": datetime.now().isoformat(),
                    "metrics": asdict(metrics)
                }
                f.write(json.dumps(log_entry) + "\\n")
        except Exception as e:
            logger.error(f"Failed to log metrics: {e}")
    
    def get_summary(self) -> Dict:
        """Get comprehensive session summary"""
        session_duration = time.time() - self.session_metrics.session_start
        
        vendor_stats = {}
        component_stats = {}
        
        for req in self.request_history:
            # Vendor stats
            if req.vendor not in vendor_stats:
                vendor_stats[req.vendor] = {"total": 0, "successful": 0}
            vendor_stats[req.vendor]["total"] += 1
            if req.success:
                vendor_stats[req.vendor]["successful"] += 1
            
            # Component stats
            if req.component_type not in component_stats:
                component_stats[req.component_type] = {"total": 0, "successful": 0}
            component_stats[req.component_type]["total"] += 1
            if req.success:
                component_stats[req.component_type]["successful"] += 1
        
        return {
            "session_duration_minutes": session_duration / 60,
            "total_requests": self.session_metrics.total_requests,
            "success_rate": self.session_metrics.success_rate,
            "block_rate": self.session_metrics.block_rate,
            "avg_request_time": (self.session_metrics.total_duration / 
                               self.session_metrics.total_requests if self.session_metrics.total_requests > 0 else 0),
            "requests_per_minute": (self.session_metrics.total_requests / 
                                  (session_duration / 60) if session_duration > 0 else 0),
            "vendor_performance": {
                vendor: {
                    "success_rate": stats["successful"] / stats["total"] if stats["total"] > 0 else 0,
                    "total_requests": stats["total"]
                }
                for vendor, stats in vendor_stats.items()
            },
            "component_performance": {
                comp: {
                    "success_rate": stats["successful"] / stats["total"] if stats["total"] > 0 else 0,
                    "total_requests": stats["total"]
                }
                for comp, stats in component_stats.items()
            }
        }