"""
Database Models for AI Escape Room
Using SQLAlchemy for structured ORM operations with SQLite.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Player(Base):
    """Represents a game participant."""
    __tablename__ = 'players'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scores = relationship("GameScore", back_populates="player", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Player(id={self.id}, name='{self.name}')>"


class GameScore(Base):
    """Stores recorded game run scores, remaining time, and completed rooms."""
    __tablename__ = 'game_scores'

    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey('players.id'), nullable=False)
    score = Column(Integer, nullable=False, default=0)
    time_remaining = Column(Integer, nullable=False, default=0) # in seconds
    rooms_completed = Column(Integer, nullable=False, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", back_populates="scores")

    def __repr__(self):
        return f"<GameScore(player_id={self.player_id}, score={self.score}, time_remaining={self.time_remaining})>"
