"""
Room 3: AI Riddle Chamber
Features:
- Dynamic AI Riddle Generation (Easy, Medium, Hard)
- Fallback local riddles
- 100 points for first attempt without hint
- 70 points after using one hint
- 40 points after multiple attempts
"""

import streamlit as st
from services.ai_service import generate_riddle
from utils.scoring import calculate_puzzle_points, calculate_room_completion_bonus

def render_room_3():
    st.markdown("### 🚪 Room 3: The AI Guardian's Riddle Chamber")
    st.info(
        "**Story:** A sentient AI sentinel blocks the corridor. "
        "To bypass its firewall, you must answer its synthetic riddle correctly. "
        "Score: **100 pts** on first attempt without hint, **70 pts** with hint, **40 pts** after multiple tries!"
    )

    # Initialize current riddle if not set
    if "r3_current_riddle" not in st.session_state:
        st.session_state.r3_current_riddle = generate_riddle("Medium", "Technology and AI")
        st.session_state.r3_attempts = 0
        st.session_state.r3_hint_used = False
        st.session_state.r3_solved = False

    # Clues
    with st.expander("🔍 Search AI Console for Data Chunks"):
        c1, c2 = st.columns(2)
        with c1:
            if st.button("💾 Inspect Neural Memory Dump", key="r3_c1"):
                st.info("Log: 'The answer is typically a single lowercase standard noun.'")
        with c2:
            if st.button("🔮 Holographic AI Projector", key="r3_c2"):
                st.warning("Projector whisper: 'If stuck, try requesting a new riddle or check the hint!'")

    # Difficulty & Regeneration
    col_d1, col_d2 = st.columns([3, 2])
    with col_d1:
        diff = st.selectbox("Select Riddle Difficulty", ["Easy", "Medium", "Hard"], index=1, key="r3_diff_select")
    with col_d2:
        if st.button("⚡ Generate New AI Riddle", key="r3_regen_btn"):
            st.session_state.r3_current_riddle = generate_riddle(diff, "Technology and Artificial Intelligence")
            st.session_state.r3_attempts = 0
            st.session_state.r3_hint_used = False
            st.session_state.r3_solved = False
            st.rerun()

    riddle = st.session_state.r3_current_riddle

    st.markdown("---")
    st.markdown(f"#### 🤖 AI Sentinel Challenge ({riddle.get('difficulty', diff)})")
    st.markdown(f"> **\"{riddle['question']}\"**")

    # Hint
    if st.session_state.r3_hint_used:
        st.warning(f"💡 **AI Hint:** {riddle['hint']}")
    else:
        if st.button("💡 Ask AI for Hint (-30 pts)", key="r3_hint_btn"):
            st.session_state.r3_hint_used = True
            st.session_state.hints_used_count += 1
            st.rerun()

    # User Answer
    user_ans = st.text_input("Enter your answer", key="r3_user_ans", placeholder="e.g. keyboard, echo, ai, book...").strip().lower()

    if st.button("🛡 Submit Answer to AI Sentinel", key="r3_submit_btn", type="primary"):
        st.session_state.r3_attempts += 1
        expected = riddle["answer"].strip().lower()
        
        # Check matching (contains or exact)
        if user_ans == expected or (len(user_ans) >= 3 and user_ans in expected):
            st.session_state.r3_solved = True
            pts = calculate_puzzle_points(st.session_state.r3_attempts, st.session_state.r3_hint_used)
            total_room_pts = pts + calculate_room_completion_bonus()
            st.success(f"🎉 **Access Granted!** AI Sentinel nods approval.\n\n*Explanation:* {riddle['explanation']}")
            st.write(f"Earned: **+{total_room_pts} points**!")
            
            if 4 not in st.session_state.unlocked_rooms:
                st.session_state.unlocked_rooms.append(4)
                st.session_state.current_room = 4
                st.session_state.score += total_room_pts
                st.balloons()
                st.rerun()
        else:
            st.error(f"❌ Incorrect! Attempt #{st.session_state.r3_attempts}. The sentinel remains guarded.")
