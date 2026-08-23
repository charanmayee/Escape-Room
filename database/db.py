"""
Database initialization and query utilities for AI Escape Room.
Supports automatic table creation and thread-safe SQLite operations.
"""

import os
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from database.models import Base, Player, GameScore

# Define SQLite database path in data/ directory
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, 'escape_room.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_database():
    """Initializes tables if they do not exist."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Yields a database session context."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def add_player(name: str) -> Player:
    """Creates or retrieves an existing player by name."""
    db = SessionLocal()
    try:
        trimmed_name = name.strip()
        player = db.query(Player).filter(Player.name == trimmed_name).first()
        if not player:
            player = Player(name=trimmed_name)
            db.add(player)
            db.commit()
            db.refresh(player)
        return player
    finally:
        db.close()

def save_score(player_id: int, score: int, time_remaining: int, rooms_completed: int) -> GameScore:
    """Saves a finished or partial escape game score."""
    db = SessionLocal()
    try:
        game_score = GameScore(
            player_id=player_id,
            score=score,
            time_remaining=time_remaining,
            rooms_completed=rooms_completed
        )
        db.add(game_score)
        db.commit()
        db.refresh(game_score)
        return game_score
    finally:
        db.close()

def get_leaderboard(limit: int = 10):
    """
    Returns the top leaderboard ranked by:
    1. Highest score
    2. Most rooms completed
    3. Highest remaining time
    """
    db = SessionLocal()
    try:
        results = (
            db.query(Player.name, GameScore.score, GameScore.rooms_completed, GameScore.time_remaining, GameScore.completed_at)
            .join(GameScore, Player.id == GameScore.player_id)
            .order_by(
                desc(GameScore.score),
                desc(GameScore.rooms_completed),
                desc(GameScore.time_remaining)
            )
            .limit(limit)
            .all()
        )
        return [
            {
                "player": r[0],
                "score": r[1],
                "rooms_completed": r[2],
                "time_remaining": r[3],
                "completed_at": r[4].strftime("%Y-%m-%d %H:%M") if r[4] else "N/A"
            }
            for r in results
        ]
    finally:
        db.close()

def get_player_history(player_id: int):
    """Retrieves all past scores for a given player ID."""
    db = SessionLocal()
    try:
        return (
            db.query(GameScore)
            .filter(GameScore.player_id == player_id)
            .order_by(desc(GameScore.completed_at))
            .all()
        )
    finally:
        db.close()
