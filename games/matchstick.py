"""
Room 5: Matchstick & Logic Puzzle Room
Features:
- Move 1 matchstick to fix the equation: 6 + 4 = 4 -> Solutions: 0 + 4 = 4, 5 + 4 = 9, 8 - 4 = 4
- Number logic reasoning puzzle
- Final Escape Door!
"""

import streamlit as st
from utils.scoring import (
    calculate_puzzle_points,
    calculate_room_completion_bonus,
    calculate_final_game_bonus,
    calculate_time_bonus
)
from utils.timer import calculate_remaining_time
from database.db import save_score

def render_room_5():
    st.markdown("### 🚪 Room 5: The Final Matchstick & Logic Vault")
    st.info(
        "**Story:** You stand before the final massive vault door of the AI Escape Room! "
        "Two optical lasers project mathematical equations and sequence patterns. "
        "Solve both challenges to trigger the emergency exit and escape to freedom!"
    )

    # Clues
    with st.expander("🔍 Search Final Chamber for Clues"):
        c1, c2 = st.columns(2)
        with c1:
            if st.button("🔦 Ancient Torch Stand", key="r5_c1"):
                st.warning("Carving: 'To fix 6 + 4 = 4, think: 0 + 4 = 4, 8 - 4 = 4, or 5 + 4 = 9!'")
        with c2:
            if st.button("📐 Geometric Floor Mosaic", key="r5_c2"):
                st.info("Mosaic pattern: Fibonacci sequence 1, 1, 2, 3, 5, 8, 13... next is 21!")

    st.markdown("#### 🔥 Challenge A: Matchstick Equation")
    st.markdown("""
    ```text
     _        _       _  
    |_  + |_| = |_| 
    |_|     |     | 
    (Equation: 6 + 4 = 4)
    ```
    """)
    st.write("**Task:** Move exactly ONE matchstick to make the equation mathematically true.")

    match_solutions = ["0 + 4 = 4", "5 + 4 = 9", "8 - 4 = 4", "0+4=4", "5+4=9", "8-4=4"]
    user_match = st.text_input("Enter valid corrected equation", key="r5_eq_ans", placeholder="e.g. 0 + 4 = 4").strip()
    
    match_correct = user_match in match_solutions

    if match_correct:
        st.success("✅ Matchstick equation balanced perfectly!")
    else:
        if st.button("💡 Matchstick Hint", key="r5_match_hint"):
            st.caption("Hint: Take the middle matchstick from '6' to turn it into '0', so 0 + 4 = 4.")

    st.markdown("---")
    st.markdown("#### 🧠 Challenge B: Logic Sequence Matrix")
    st.write("Find the missing number in the Fibonacci security sequence:")
    st.markdown("`2, 3, 5, 8, 13, [ ? ]`")
    
    seq_ans = st.text_input("Enter missing number", key="r5_seq_ans", placeholder="e.g. 21").strip()
    seq_correct = seq_ans == "21"

    if seq_correct:
        st.success("✅ Sequence confirmed: 21 (Sum of previous two numbers: 8 + 13 = 21)")
    else:
        if st.button("💡 Sequence Hint", key="r5_seq_hint"):
            st.caption("Hint: Each number is the sum of the preceding two numbers (8 + 13).")

    st.markdown("---")
    st.markdown("#### 🚨 Emergency Escape Blast Doors")

    if st.button("🚀 TRIGGER FINAL ESCAPE PROTOCOL", key="r5_final_escape_btn", type="primary"):
        if match_correct and seq_correct:
            rem_time = calculate_remaining_time(st.session_state.start_time)
            time_bonus = calculate_time_bonus(rem_time)
            p_pts = calculate_puzzle_points(1, False) * 2
            room_bonus = calculate_room_completion_bonus()
            game_bonus = calculate_final_game_bonus()
            
            total_earned = p_pts + room_bonus + game_bonus + time_bonus
            st.session_state.score += total_earned
            st.session_state.escaped = True
            st.session_state.game_over = True
            
            # Save to database
            if st.session_state.player_id:
                try:
                    save_score(
                        player_id=st.session_state.player_id,
                        score=st.session_state.score,
                        time_remaining=rem_time,
                        rooms_completed=5
                    )
                except Exception as e:
                    print(f"Error saving final score: {e}")

            st.balloons()
            st.rerun()
        else:
            st.error("❌ Both Challenge A and Challenge B must be correctly solved to trigger the escape!")
