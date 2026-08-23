"""
AI Service module for dynamic escape room riddles, contextual hints, and student-themed word puzzles.
Supports OpenAI API (with json_object response format) and graceful fallback when offline or without API key.
"""

import os
import json
import random
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

# Path to local fallback puzzles
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
FALLBACK_FILE = os.path.join(DATA_DIR, 'fallback_puzzles.json')

def load_fallback_data() -> Dict[str, Any]:
    """Loads fallback puzzles from the JSON data file."""
    try:
        if os.path.exists(FALLBACK_FILE):
            with open(FALLBACK_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading fallback puzzles: {e}")
    
    return {
        "riddles": [
            {
                "difficulty": "Medium",
                "theme": "Artificial Intelligence",
                "question": "I speak without a mouth and hear without ears. In programming, I repeat whatever you tell me. What am I?",
                "answer": "echo",
                "hint": "You can hear me in mountains, or type me in bash.",
                "explanation": "Echo returns sound in nature or repeats text in shell commands."
            }
        ]
    }

def generate_riddle(difficulty: str = "Medium", theme: str = "Technology and AI") -> Dict[str, str]:
    """
    Generates an escape room riddle using AI API or retrieves a curated fallback.
    Returns: { "question": str, "answer": str, "hint": str, "explanation": str }
    """
    # Attempt AI API generation if OpenAI key is present
    if os.getenv("OPENAI_API_KEY"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

            prompt = f"""
            Generate one clever, student-friendly escape room riddle.
            Theme: {theme}
            Difficulty: {difficulty}

            The answer should be a single word or short phrase (lowercase, 1-3 words max).
            Return valid JSON with exactly these keys:
            {{
                "question": "The riddle text",
                "answer": "the_answer_in_lowercase",
                "hint": "A subtle helpful clue",
                "explanation": "Why this answer is correct"
            }}
            """

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a master escape room puzzle designer. Output strictly JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            parsed = json.loads(content)
            
            return {
                "question": parsed.get("question", "What has keys but cannot open doors?"),
                "answer": parsed.get("answer", "piano").strip().lower(),
                "hint": parsed.get("hint", "It plays musical notes."),
                "explanation": parsed.get("explanation", "A piano has black and white keys.")
            }
        except Exception as err:
            print(f"OpenAI Generation failed, falling back to local riddle: {err}")

    # Fallback from local file
    fallback_data = load_fallback_data()
    riddles = fallback_data.get("riddles", [])
    
    # Filter by difficulty if possible
    matching = [r for r in riddles if r.get("difficulty", "").lower() == difficulty.lower()]
    selected = random.choice(matching if matching else riddles)
    
    return {
        "question": selected.get("question"),
        "answer": selected.get("answer", "").strip().lower(),
        "hint": selected.get("hint", ""),
        "explanation": selected.get("explanation", "")
    }

def generate_hint(puzzle_context: str, current_answer: str) -> str:
    """
    Generates a contextual hint for the current puzzle.
    """
    if os.getenv("OPENAI_API_KEY"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            prompt = f"Provide a one-sentence clever hint for this escape room puzzle without revealing the answer: '{puzzle_context}'"
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=60,
                temperature=0.6
            )
            return response.choices[0].message.content.strip()
        except Exception:
            pass

    return f"Think carefully about related concepts and patterns in '{puzzle_context[:30]}...'."

def generate_word_puzzle(topic: str = "College Life") -> Dict[str, Any]:
    """Generates scrambled word list or returns student life preset."""
    words = ["PYTHON", "COLLEGE", "STUDENT", "PROJECT", "CODING"]
    scrambled = []
    for w in words:
        chars = list(w)
        random.shuffle(chars)
        scrambled.append("".join(chars))
    return {
        "original_words": words,
        "scrambled_words": scrambled,
        "key": "".join(w[0] for w in words) # "PCSPC"
    }
