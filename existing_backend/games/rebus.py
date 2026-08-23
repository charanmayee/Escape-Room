"""
Room 4: Rebus Puzzle Room
Features:
- 4 Visual / Text Rebus Puzzles:
  1. cycle cycle cycle -> Tricycle (Lock digit: 4)
  2. MAN / BOARD -> Man Overboard (Lock digit: 8)
  3. STAND / I -> I Understand (Lock digit: 2)
  4. MCE MCE MCE -> Three Blind Mice (Lock digit: 7)
- Combined Lock Code: 4827
"""

import streamlit as st
from utils.scoring import calculate_puzzle_points, calculate_room_completion_bonus

REBUS_DATA = [
    {
        "id": 1,
        "display": "🚲 cycle\n🚲 cycle\n🚲 cycle",
        "description": "Three repetitions of the word 'cycle'",
        "answer": "TRICYCLE",
        "code_digit": "4",
        "hint": "Count how many cycles there are (3 = Tri-)."
    },
    {
        "id": 2,
        "display": "  MAN  \n———————\n BOARD ",
        "description": "The word MAN positioned above/over the word BOARD",
        "answer": "MAN OVERBOARD",
        "code_digit": "8",
        "hint": "Think about spatial position: MAN is OVER the word BOARD."
    },
    {
        "id": 3,
        "display": "STAND\n  I  ",
        "description": "The letter I located beneath the word STAND",
        "answer": "I UNDERSTAND",
        "code_digit": "2",
        "hint": "The letter 'I' is UNDER the word 'STAND'."
    },
    {
        "id": 4,
        "display": "M C E   M C E   M C E",
        "description": "Three mice written without the letter 'i' ('no eyes')",
        "answer": "THREE BLIND MICE",
        "code_digit": "7",
        "hint": "Three mice with no 'I's (eyes)... like the nursery rhyme."
    }
]

FINAL_REBUS_CODE = "4827"

def render_room_4():
    st.markdown("### 🚪 Room 4: The Visual Rebus Gallery")
    st.info(
        "**Story:** The walls of this gallery are lined with cryptic visual wordplay (Rebus puzzles). "
        "Solve each Rebus card to uncover its secret digit, then combine the digits to form the 4-digit lock code: **4827**!"
    )

    # Clues
    with st.expander("🔍 Search Rebus Gallery for Hidden Clues"):
        c1, c2 = st.columns(2)
        with c1:
            if st.button("🖼 Inspect Framed Picture on Wall", key="r4_c1"):
                st.warning("Behind the frame: 'Card 1 gives 4, Card 2 gives 8, Card 3 gives 2, Card 4 gives 7!'")
        with c2:
            if st.button("🏺 Inspect Bronze Pedestal", key="r4_c2"):
                st.info("Engraving: 'Rebus puzzles transform word positions into phrases.'")

    st.markdown("#### 🖼 Rebus Cards")
    solved_digits = []
    
    for i, item in enumerate(REBUS_DATA):
        k_ans = f"r4_ans_{i}"
        k_status = f"r4_status_{i}"
        if k_status not in st.session_state:
            st.session_state[k_status] = False

        c1, c2, c3 = st.columns([3, 4, 2])
        with c1:
            st.code(item["display"], language="text")
            st.caption(f"Rebus Card #{i+1}")
        with c2:
            st.write(f"*{item['description']}*")
            val = st.text_input(f"Your interpretation #{i+1}", key=k_ans, placeholder="e.g. phrase", label_visibility="collapsed")
            cleaned = val.strip().upper().replace("-", " ")
            if cleaned == item["answer"] or item["answer"] in cleaned:
                st.session_state[k_status] = True
        with c3:
            if st.session_state[k_status]:
                st.success(f"✅ Solved!\n\n**Digit: {item['code_digit']}**")
                solved_digits.append(item["code_digit"])
            else:
                if st.button(f"💡 Hint {i+1}", key=f"r4_hint_{i}"):
                    st.caption(f"Hint: {item['hint']}")

    st.markdown("---")
    st.markdown("#### 🔒 4-Digit Combination Safe")
    if solved_digits:
        st.write(f"Unlocked Digits: `{''.join(solved_digits)}`")

    code_input = st.text_input("Enter 4-Digit Safe Code", key="r4_safe_code", max_chars=4, placeholder="e.g. 4827").strip()

    if st.button("🔓 Crack Room 4 Safe", key="r4_unlock_btn", type="primary"):
        if code_input == FINAL_REBUS_CODE:
            st.success("🎉 Click-clack! Safe opens revealing the master elevator key to Room 5!")
            if 5 not in st.session_state.unlocked_rooms:
                st.session_state.unlocked_rooms.append(5)
                st.session_state.current_room = 5
                points = calculate_puzzle_points(1, False) + calculate_room_completion_bonus()
                st.session_state.score += points
                st.balloons()
                st.rerun()
        else:
            st.error("❌ Buzzer sounds! Wrong code. Check your solved Rebus digits.")
