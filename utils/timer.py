"""
Countdown Timer utility for AI Escape Room
"""

import time
from typing import Tuple

DEFAULT_TOTAL_TIME = 900 # 15 minutes = 900 seconds

def calculate_remaining_time(start_timestamp: float, total_seconds: int = DEFAULT_TOTAL_TIME) -> int:
    """Calculates remaining time in seconds."""
    if not start_timestamp:
        return total_seconds
    elapsed = int(time.time() - start_timestamp)
    remaining = max(0, total_seconds - elapsed)
    return remaining

def format_time(seconds: int) -> str:
    """Formats seconds into MM:SS display string."""
    mins = seconds // 60
    secs = seconds % 60
    return f"{mins:02d}:{secs:02d}"

def is_time_expired(start_timestamp: float, total_seconds: int = DEFAULT_TOTAL_TIME) -> bool:
    """Returns True if the time has run out."""
    return calculate_remaining_time(start_timestamp, total_seconds) <= 0
