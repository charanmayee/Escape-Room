"""
Game state management helpers for Streamlit session_state
"""

import time
import streamlit as st

def init_game_state():
    """Initializes default keys in st.session_state."""
    defaults = {
        "game_started": False,
        "game_over": False,
        "escaped": False,
        "player_name": "",
        "player_id": None,
        "current_room": 1,
        "score": 0,
        "start_time": None,
        "remaining_time": 900,
        "hints_remaining": 5,
        "hints_used_count": 0,
        "unlocked_rooms": [1],
        "discovered_clues": [],
        "room_puzzle_states": {},
        "attempts": {},
        "hint_active_for_puzzle": {}
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

def reset_game():
    """Resets the game state back to new game."""
    st.session_state.game_started = False
    st.session_state.game_over = False
    st.session_state.escaped = False
    st.session_state.current_room = 1
    st.session_state.score = 0
    st.session_state.start_time = None
    st.session_state.remaining_time = 900
    st.session_state.hints_remaining = 5
    st.session_state.hints_used_count = 0
    st.session_state.unlocked_rooms = [1]
    st.session_state.discovered_clues = []
    st.session_state.room_puzzle_states = {}
    st.session_state.attempts = {}
    st.session_state.hint_active_for_puzzle = {}

def start_new_game(player_name: str, player_id: int):
    """Starts the countdown and initializes player session."""
    reset_game()
    st.session_state.player_name = player_name
    st.session_state.player_id = player_id
    st.session_state.game_started = True
    st.session_state.start_time = time.time()
