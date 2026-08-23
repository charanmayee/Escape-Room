"""
Scoring system calculation for AI Escape Room
"""

def calculate_puzzle_points(attempts: int, hint_used: bool) -> int:
    """
    Scoring rules:
    - Solve puzzle on first attempt without hint: 100 pts
    - Solve with hint: 70 pts
    - Solve after multiple attempts: 50 pts (40 if hint also used)
    """
    if attempts <= 1 and not hint_used:
        return 100
    elif hint_used and attempts <= 2:
        return 70
    elif hint_used:
        return 40
    else:
        return 50

def calculate_room_completion_bonus() -> int:
    """Bonus awarded upon unlocking any room door."""
    return 200

def calculate_final_game_bonus() -> int:
    """Bonus awarded upon completing the entire escape room."""
    return 500

def calculate_time_bonus(remaining_seconds: int, multiplier: float = 2.0) -> int:
    """Bonus for escaping with spare time on the clock."""
    return int(remaining_seconds * multiplier)
