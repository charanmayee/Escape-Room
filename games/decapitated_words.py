"""
Room 2: Decapitated Word Puzzle Room
Theme: Categories (Animals, Technology, College, Objects, Programming)
Pattern: Player receives a word with masked ends/letters and a clue.
Reward: Secret key `ESCAPE2026`
"""

import streamlit as st
from utils.scoring import calculate_puzzle_points, calculate_room_completion_bonus

DECAPITATED_DATA = [
    {
        "pattern": "_ A T _",
        "category": "Animals",
        "clue": "A furry domestic animal that meows and catches mice.",
        "answer": "CAT",
        "hint": "Three letters, rhymes with bat."
    },
    {
        "pattern": "_ Y T H O _",
        "category": "Programming",
        "clue": "A versatile high-level programming language named after a comedy troupe.",
        "answer": "PYTHON",
        "hint": "Named after Monty Python."
    },
    {
        "pattern": "_ O B O _",
        "category": "Technology",
        "clue": "An automated mechanical machine capable of carrying out complex tasks.",
        "answer": "ROBOT",
        "hint": "Starts with R, ends with T."
    },
    {
        "pattern": "_ A P T O _",
        "category": "College Objects",
        "clue": "A portable personal computer you carry to class lectures.",
        "answer": "LAPTOP",
        "hint": "Folds open on your lap."
    },
    {
        "pattern": "_ O M P I L E _",
        "category": "Computer Science",
        "clue": "A software tool that translates source code into machine executable binaries.",
        "answer": "COMPILER",
        "hint": "C++ and Rust use this before running."
    }
]

SECRET_KEY = "ESCAPE2026"

def render_room_2():
    st.markdown("### 🚪 Room 2: The Decapitated Cipher Archive")
    st.info(
        "**Story:** You've entered an ancient cyber archives hall! "
        "The security console requires deciphering 5 damaged word patterns across different categories. "
        "Complete each word pattern to reveal the master security key: **ESCAPE2026**!"
    )

    # Clues
    with st.expander("🔍 Search Room for Hidden Clues"):
        col_c1, col_c2 = st.columns(2)
        with col_c1:
            if st.button("🗄 Metal File Drawer", key="r2_c1"):
                st.warning("Found a sticky note: 'All answers are single common English nouns.'")
        with col_c2:
            if st.button("🪞 Dusty Wall Mirror", key="r2_c2"):
                st.info("Etched into mirror edge: 'Key is ESCAPE2026 when all patterns match!'")

    st.markdown("#### 🔡 Decapitated Word Patterns")
    solved_count = 0

    for i, item in enumerate(DECAPITATED_DATA):
        key_ans = f"r2_word_{i}"
        key_status = f"r2_word_solved_{i}"
        if key_status not in st.session_state:
            st.session_state[key_status] = False

        c1, c2, c3 = st.columns([3, 4, 2])
        with c1:
            st.markdown(f"**Pattern {i+1}:** `{item['pattern']}`\n\n*({item['category']})*")
        with c2:
            st.caption(f"**Clue:** {item['clue']}")
            val = st.text_input(f"Answer {i+1}", key=key_ans, placeholder="Full word", label_visibility="collapsed")
            if val.strip().upper() == item["answer"]:
                st.session_state[key_status] = True
        with c3:
            if st.session_state[key_status]:
                st.success(f"✅ {item['answer']}")
                solved_count += 1
            else:
                if st.button(f"💡 Hint {i+1}", key=f"r2_hint_btn_{i}"):
                    st.caption(f"Hint: {item['hint']}")

    st.markdown("---")
    st.markdown("#### 🗝 Key Console & Door Lock")
    
    if solved_count == len(DECAPITATED_DATA):
        st.success(f"🎊 All 5 patterns verified! Master Key Revealed: `{SECRET_KEY}`")
    else:
        st.write(f"Patterns Solved: **{solved_count} / {len(DECAPITATED_DATA)}**")

    key_input = st.text_input("Enter Vault Secret Key", key="r2_secret_key_input", placeholder="e.g. ESCAPE2026").strip().upper()

    if st.button("🔓 Unlock Room 2 Door", key="r2_unlock_btn", type="primary"):
        if key_input == SECRET_KEY:
            st.success("🎉 Vault Door Opens! Moving to Room 3!")
            if 3 not in st.session_state.unlocked_rooms:
                st.session_state.unlocked_rooms.append(3)
                st.session_state.current_room = 3
                points = calculate_puzzle_points(1, False) + calculate_room_completion_bonus()
                st.session_state.score += points
                st.balloons()
                st.rerun()
        else:
            st.error("❌ Invalid Key! Solve all 5 patterns or verify your input.")
