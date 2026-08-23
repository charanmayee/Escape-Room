"""
AI Escape Room – Complete Streamlit Application
A real-time puzzle-solving game where players escape thematic rooms before time runs out.
"""

import time
import streamlit as st

# Set page configuration with dark theme
st.set_page_config(
    page_title="AI Escape Room",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Import internal modules
from database.db import create_database, add_player, save_score, get_leaderboard
from utils.game_state import init_game_state, reset_game, start_new_game
from utils.timer import calculate_remaining_time, format_time, is_time_expired
from games.word_scramble import render_room_1
from games.decapitated_words import render_room_2
from games.riddles import render_room_3
from games.rebus import render_room_4
from games.matchstick import render_room_5
from games.sudoku import render_sudoku
from games.color_sequence import render_color_sequence
from games.spot_difference import render_spot_difference

# Initialize Database & Session State
create_database()
init_game_state()

# Custom CSS for dark escape room theme
st.markdown("""
<style>
    .stApp {
        background-color: #0b0f19;
        color: #e2e8f0;
    }
    .metric-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
    }
    .timer-alert {
        color: #ef4444;
        font-weight: bold;
        font-size: 1.3rem;
    }
    .room-header {
        color: #38bdf8;
        font-weight: 700;
    }
</style>
""", unsafe_allow_html=True)

# ----------------- SIDEBAR -----------------
with st.sidebar:
    st.markdown("## 🔐 AI ESCAPE ROOM")
    st.markdown("*Can you break out before the timer hits zero?*")
    st.markdown("---")

    if st.session_state.game_started and not st.session_state.game_over:
        # Calculate real-time timer
        rem_sec = calculate_remaining_time(st.session_state.start_time)
        st.session_state.remaining_time = rem_sec

        # Check for time expiry
        if rem_sec <= 0:
            st.session_state.game_over = True
            st.session_state.escaped = False
            st.error("⏰ TIME'S UP! The facility locked down permanently!")
            st.rerun()

        # Display Player & Timer Metrics
        st.metric("👤 Player", st.session_state.player_name)
        
        timer_str = format_time(rem_sec)
        if rem_sec < 180:
            st.markdown(f"⏱ **Time Left:** <span class='timer-alert'>{timer_str}</span>", unsafe_allow_html=True)
        else:
            st.metric("⏱ Time Left", timer_str)

        st.metric("🏆 Score", f"{st.session_state.score} pts")
        st.metric("🚪 Current Room", f"Room {st.session_state.current_room} / 5")
        
        progress = (len(st.session_state.unlocked_rooms) - 1) / 5.0
        st.progress(min(1.0, max(0.0, progress)), text=f"Escape Progress: {int(progress * 100)}%")

        st.markdown("---")
        st.markdown("### 🗝 Discovered Clues")
        if st.session_state.discovered_clues:
            for clue in st.session_state.discovered_clues[-4:]:
                st.caption(f"• {clue}")
        else:
            st.caption("No clues inspected yet. Click 'Search Room' inside rooms!")

        st.markdown("---")
        if st.button("🔄 Abandon & Restart Run", key="sidebar_restart_btn"):
            reset_game()
            st.rerun()

    else:
        st.info("Enter your name and click **Start Game** to begin!")
        st.markdown("### 📜 Rules:")
        st.markdown("""
        1. **15 Minutes** on the clock to escape 5 rooms.
        2. Solve puzzles to unlock each room door.
        3. Search rooms for hidden clues.
        4. Hints are available but reduce point yield.
        5. Bonus points awarded for fast escapes!
        """)

# ----------------- MAIN VIEW -----------------

# View 1: Leaderboard or Home Screen
if not st.session_state.game_started and not st.session_state.game_over:
    tab_play, tab_leaderboard, tab_bonus = st.tabs(["🎮 Start Escape Game", "🏆 High Scores Leaderboard", "🧩 Mini-Game Vault"])

    with tab_play:
        st.title("🔐 Welcome to AI Escape Room")
        st.markdown(
            "You are trapped inside the high-tech AI Research Facility lockdown sector! "
            "To break free, you must crack word scrambles, decapitated ciphers, AI riddles, visual rebuses, "
            "and matchstick logic equations before the 15-minute emergency countdown expires."
        )

        col_name, col_btn = st.columns([3, 2])
        with col_name:
            p_name = st.text_input("Enter Player Codename / Name:", placeholder="e.g. Agent Phoenix", max_chars=30)
        with col_btn:
            st.write("")
            st.write("")
            if st.button("🚀 INITIATE ESCAPE RUN", type="primary", use_container_width=True):
                if p_name.strip():
                    player = add_player(p_name.strip())
                    start_new_game(player.name, player.id)
                    st.rerun()
                else:
                    st.warning("Please enter a player name before starting!")

        st.markdown("---")
        st.markdown("### 🗺 Room Blueprint Overview")
        c1, c2, c3, c4, c5 = st.columns(5)
        with c1:
            st.markdown("##### Room 1\n**Word Scramble**\nCampus Dorms")
        with c2:
            st.markdown("##### Room 2\n**Decapitated Cipher**\nCyber Archives")
        with c3:
            st.markdown("##### Room 3\n**AI Sentinel Riddle**\nNeural Core")
        with c4:
            st.markdown("##### Room 4\n**Visual Rebus**\nGallery Safe")
        with c5:
            st.markdown("##### Room 5\n**Matchstick Logic**\nBlast Vault")

    with tab_leaderboard:
        st.subheader("🏆 Global Escape Leaderboard")
        board = get_leaderboard(10)
        if board:
            st.table(board)
        else:
            st.info("No recorded escape runs yet! Be the first to conquer the rooms!")

    with tab_bonus:
        st.subheader("🧩 Practice Mini-Games")
        sub_tab1, sub_tab2, sub_tab3 = st.tabs(["4x4 Sudoku", "Color Sequence", "Spot The Difference"])
        with sub_tab1:
            render_sudoku()
        with sub_tab2:
            render_color_sequence()
        with sub_tab3:
            render_spot_difference()

# View 2: Active Gameplay (Rooms 1 through 5)
elif st.session_state.game_started and not st.session_state.game_over:
    current = st.session_state.current_room

    # Top room navigation tabs (only allowed to click unlocked rooms)
    tab_labels = [f"Room {i}" + (" 🔓" if i in st.session_state.unlocked_rooms else " 🔒") for i in range(1, 6)]
    tabs = st.tabs(tab_labels + ["Bonus Mini-Games"])

    with tabs[0]:
        if 1 in st.session_state.unlocked_rooms:
            render_room_1()
        else:
            st.warning("Room 1 is locked.")

    with tabs[1]:
        if 2 in st.session_state.unlocked_rooms:
            render_room_2()
        else:
            st.warning("🔒 Solve Room 1 to unlock Room 2!")

    with tabs[2]:
        if 3 in st.session_state.unlocked_rooms:
            render_room_3()
        else:
            st.warning("🔒 Solve Room 2 to unlock Room 3!")

    with tabs[3]:
        if 4 in st.session_state.unlocked_rooms:
            render_room_4()
        else:
            st.warning("🔒 Solve Room 3 to unlock Room 4!")

    with tabs[4]:
        if 5 in st.session_state.unlocked_rooms:
            render_room_5()
        else:
            st.warning("🔒 Solve Room 4 to unlock Room 5!")

    with tabs[5]:
        st.subheader("⚡ Bonus Vault Challenges (Extra Score)")
        b1, b2, b3 = st.tabs(["4x4 Sudoku (+150 pts)", "Chroma Sequence (+100 pts)", "Spot Difference (+100 pts)"])
        with b1:
            render_sudoku()
        with b2:
            render_color_sequence()
        with b3:
            render_spot_difference()

# View 3: Game Over or Victory Screen
elif st.session_state.game_over:
    if st.session_state.escaped:
        st.balloons()
        st.success("🎉 CONGRATULATIONS! YOU SUCCESSFULLY ESCAPED THE FACILITY!")
        st.markdown(f"### 🏆 Final Score: **{st.session_state.score} Points**")
        
        rem_sec = st.session_state.remaining_time
        st.write(f"⏱ Time Remaining: **{format_time(rem_sec)}**")
        st.write(f"🚪 Rooms Cleared: **5 / 5**")
        st.write(f"💡 Hints Used: **{st.session_state.hints_used_count}**")

    else:
        st.error("💀 LOCKDOWN INITIATED: TIME RAN OUT!")
        st.markdown(f"### 📊 Final Score: **{st.session_state.score} Points**")
        st.write(f"🚪 Rooms Reached: **Room {st.session_state.current_room} / 5**")

    st.markdown("---")
    st.subheader("🏆 Updated Leaderboard")
    st.table(get_leaderboard(10))

    if st.button("🔄 Play Again", type="primary"):
        reset_game()
        st.rerun()
