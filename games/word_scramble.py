"""
Room 1: Word Puzzle Room – Word Scramble / Anagrams
Theme: College & Student Life
Puzzles: NPEYTHO, GLOCLEE, TNUDETS, TCOJERP, GIDCON
Goal: Unscramble each word, extract first letters to form passcode: PCSPC
"""

import streamlit as st
from utils.scoring import calculate_puzzle_points, calculate_room_completion_bonus

WORDS_DATA = [
    {"scrambled": "N P E Y T H O", "answer": "PYTHON", "hint": "The most popular student coding language for AI & Data Science."},
    {"scrambled": "G L O C L E E", "answer": "COLLEGE", "hint": "The higher education institution you attend after high school."},
    {"scrambled": "T N U D E T S", "answer": "STUDENT", "hint": "A person dedicated to learning and taking courses."},
    {"scrambled": "T C O J E R P", "answer": "PROJECT", "hint": "A collaborative college assignment built for final submission."},
    {"scrambled": "G I D C O N", "answer": "CODING", "hint": "The act of writing computer algorithms and scripts."}
]

FINAL_CODE = "PCSPC"

def render_room_1():
    st.markdown("### 🚪 Room 1: The Campus Dormitory Lockdown")
    st.info(
        "**Story:** You woke up locked inside the campus computer lab after a late-night hackathon! "
        "The electronic door lock requires a 5-letter master override code. "
        "Unscramble the student life words on the whiteboard and take the **first letter of each solved word**!"
    )

    # Hidden Room Clues
    with st.expander("🔍 Search Room for Hidden Clues"):
        col_c1, col_c2, col_c3 = st.columns(3)
        with col_c1:
            if st.button("📘 Physics Notebook", key="r1_c1"):
                st.session_state.discovered_clues.append("Physics Notebook: 'First letters hold the key'")
                st.warning("You found notes: 'Remember to assemble the FIRST letter of each solved puzzle!'")
        with col_c2:
            if st.button("☕ Dean's Coffee Mug", key="r1_c2"):
                st.session_state.discovered_clues.append("Coffee Mug: 'Total 5 words'")
                st.info("Underneath the mug: '5 words total. P-C-S-P-C format.'")
        with col_c3:
            if st.button("💻 Terminal Screen", key="r1_c3"):
                st.session_state.discovered_clues.append("Terminal: 'All uppercase'")
                st.info("Terminal says: 'Passcode is case-insensitive, 5 uppercase letters.'")

    # Word solving cards
    solved_letters = []
    all_solved = True

    st.markdown("#### 🧩 Word Scramble Whiteboard")
    
    for i, item in enumerate(WORDS_DATA):
        key_ans = f"r1_word_{i}"
        key_status = f"r1_word_solved_{i}"
        
        if key_status not in st.session_state:
            st.session_state[key_status] = False

        c1, c2, c3 = st.columns([3, 3, 2])
        with c1:
            st.markdown(f"**Word {i+1}:** `{item['scrambled']}`")
        with c2:
            val = st.text_input(f"Your Answer {i+1}", key=key_ans, placeholder="Enter unscrambled word", label_visibility="collapsed")
            if val.strip().upper() == item["answer"]:
                st.session_state[key_status] = True
        with c3:
            if st.session_state[key_status]:
                st.success(f"✅ Correct! [{item['answer'][0]}]")
                solved_letters.append(item['answer'][0])
            else:
                all_solved = False
                if st.button(f"💡 Hint {i+1}", key=f"r1_hint_btn_{i}"):
                    st.caption(f"Hint: {item['hint']}")

    # Door keypad
    st.markdown("---")
    st.markdown("#### 🔐 Door Keypad Terminal")
    if solved_letters:
        st.write(f"**Extracted First Letters So Far:** `{' '.join(solved_letters)}`")
    
    door_input = st.text_input("Enter 5-Letter Door Code", key="r1_door_code", max_chars=5, placeholder="e.g. PCSPC").strip().upper()
    
    if st.button("🔓 Unlock Room 1 Door", key="r1_unlock_btn", type="primary"):
        if door_input == FINAL_CODE:
            st.success("🎉 Door lock turns green! Click sound heard! Room 1 unlocked!")
            if 2 not in st.session_state.unlocked_rooms:
                st.session_state.unlocked_rooms.append(2)
                st.session_state.current_room = 2
                points = calculate_puzzle_points(1, False) + calculate_room_completion_bonus()
                st.session_state.score += points
                st.balloons()
                st.rerun()
        else:
            st.error("❌ Access Denied! Incorrect code. Check your unscrambled words!")
