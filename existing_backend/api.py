"""
Existing Backend REST API for AI Escape Room
Communicates with Flutter Frontend, SQLite Database, and Gemini AI.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Internal module imports
from database.db import create_database, add_player, save_score, get_leaderboard
from services.ai_service import generate_riddle, generate_hint
from utils.scoring import calculate_final_score

load_dotenv()

app = Flask(__name__)
CORS(app)

# Ensure database is initialized
create_database()

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
LEADERBOARD_PATH = os.path.join(DATA_DIR, 'leaderboard.json')


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "AI Escape Room Backend"
    })


@app.route('/api/player/register', methods=['POST'])
def register_player():
    data = request.get_json() or {}
    player_name = data.get('name', '').strip()
    if not player_name:
        return jsonify({"error": "Player name is required"}), 400

    player = add_player(player_name)
    return jsonify({
        "id": player.id,
        "name": player.name,
        "created_at": player.created_at.isoformat() if player.created_at else None
    })


@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard_api():
    try:
        # Fetch from SQLite database
        entries = get_leaderboard(limit=10)
        return jsonify({"leaderboard": entries})
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return jsonify({"error": "Failed to retrieve leaderboard"}), 500


@app.route('/api/leaderboard', methods=['POST'])
def save_score_api():
    try:
        data = request.get_json() or {}
        player_name = data.get('player', '').strip()
        score = int(data.get('score', 0))
        time_remaining = int(data.get('time_remaining', 0))
        rooms_completed = int(data.get('rooms_completed', 0))
        difficulty = data.get('difficulty', 'Medium')

        if not player_name:
            return jsonify({"error": "Player name is required"}), 400

        # Save to SQLite database
        player = add_player(player_name)
        saved = save_score(
            player_id=player.id,
            score=score,
            time_remaining=time_remaining,
            rooms_completed=rooms_completed
        )

        entry = {
            "player": player.name,
            "score": saved.score,
            "rooms_completed": saved.rooms_completed,
            "time_remaining": saved.time_remaining,
            "difficulty": difficulty,
            "completed_at": saved.completed_at.isoformat() if saved.completed_at else datetime.utcnow().isoformat()
        }

        return jsonify({"success": True, "entry": entry})
    except Exception as e:
        print(f"Error saving score: {e}")
        return jsonify({"error": "Failed to save score"}), 500


@app.route('/api/gemini/riddle', methods=['POST'])
def get_gemini_riddle():
    try:
        data = request.get_json() or {}
        difficulty = data.get('difficulty', 'Medium')
        theme = data.get('theme', 'Technology and Artificial Intelligence')

        riddle_data = generate_riddle(difficulty=difficulty, theme=theme)
        
        # In player-facing API, return riddle question & hint without leaking plain answer
        return jsonify({
            "riddle": {
                "question": riddle_data.get("question"),
                "hint": riddle_data.get("hint"),
                "difficulty": difficulty,
                "theme": theme,
                # answer is kept on backend for validation
                "puzzle_id": f"riddle_{int(datetime.utcnow().timestamp())}"
            }
        })
    except Exception as e:
        print(f"Error in riddle generation: {e}")
        return jsonify({
            "riddle": {
                "question": "I have keys but no locks. I have a space but no room. You can enter, but you cannot go outside. What am I?",
                "hint": "You use it to write code and type messages.",
                "difficulty": "Medium",
                "theme": "Technology"
            }
        })


@app.route('/api/gemini/hint', methods=['POST'])
def get_contextual_hint():
    try:
        data = request.get_json() or {}
        room = data.get('room', 'Room 1')
        puzzle_title = data.get('puzzleTitle', '')
        puzzle_detail = data.get('puzzleDetail', '')

        hint_text = generate_hint(f"{room}: {puzzle_title} - {puzzle_detail}", "")
        return jsonify({"hint": hint_text})
    except Exception as e:
        print(f"Error generating hint: {e}")
        return jsonify({"hint": "Look closely at the pattern, first letters, or sequence numbers!"})


@app.route('/api/puzzles/verify', methods=['POST'])
def verify_puzzle():
    try:
        data = request.get_json() or {}
        room = data.get('room')
        puzzle_id = data.get('puzzleId')
        answer = str(data.get('answer', '')).strip().upper()

        if room is None or not puzzle_id:
            return jsonify({"error": "Missing parameters"}), 400

        is_correct = False

        if room == 1:
            r1 = {
                "w1": "PYTHON",
                "w2": "COLLEGE",
                "w3": "STUDENT",
                "w4": "PROJECT",
                "w5": "CODING",
                "door": "PCSPC"
            }
            is_correct = r1.get(puzzle_id) == answer

        elif room == 2:
            r2 = {
                "d1": "CAMPUS",
                "d2": "LIBRARY",
                "d3": "ALGORITHM",
                "d4": "DATABASE",
                "d5": "SEMESTER",
                "door": "ESCAPE2026"
            }
            is_correct = r2.get(puzzle_id) == answer

        elif room == 3:
            # AI Riddle answer validation
            valid_riddle_answers = ["KEYBOARD", "ECHO", "CIPHER", "BOOK", "PIANO", "FIRE", "CLOCK"]
            is_correct = answer in valid_riddle_answers or any(a in answer for a in valid_riddle_answers)

        elif room == 4:
            r4 = {
                "r1": ["TRICYCLE", "A TRICYCLE", "TRI CYCLE"],
                "r2": ["MAN OVERBOARD", "MAN OVER BOARD"],
                "r3": ["FORGET IT", "FORGET-IT"],
                "r4": ["NEON LIGHTS", "NEON LIGHT"],
                "safe": ["4827"]
            }
            answers_list = r4.get(puzzle_id, [])
            is_correct = any(a == answer or a in answer for a in answers_list)

        elif room == 5:
            if puzzle_id == "match":
                norm = answer.replace(" ", "")
                is_correct = norm in ["0+4=4", "8-4=4"]
            elif puzzle_id == "sequence":
                is_correct = answer == "21"

        elif str(room) == "bonus":
            if puzzle_id == "color":
                is_correct = answer in ["CYAN,AMBER,ROSE,EMERALD", "CYAN, AMBER, ROSE, EMERALD"]
            elif puzzle_id == "spot":
                is_correct = answer in ["DIF3", "CIRCUIT 3", "3"]

        return jsonify({"correct": is_correct})
    except Exception as e:
        print(f"Error verifying puzzle: {e}")
        return jsonify({"error": "Verification error"}), 500


if __name__ == '__main__':
    port = int(os.getenv('BACKEND_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
