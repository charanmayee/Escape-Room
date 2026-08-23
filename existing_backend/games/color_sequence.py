"""
Bonus Mini-Game: Color Sequence Lock
Clue:
"The color of fire comes first (RED),
the color of the ocean comes second (BLUE),
the color of nature comes third (GREEN),
and the color of the sun comes last (YELLOW)."
"""

import streamlit as st

CORRECT_COLOR_SEQUENCE = ["🔴 RED", "🔵 BLUE", "🟢 GREEN", "🟡 YELLOW"]

def render_color_sequence():
    st.markdown("### 🌈 Chroma Lock: Color Sequence Challenge")
    st.info(
        "**Ancient Riddle:**\n\n"
        "> *'The color of fire comes first,*\n"
        "> *the color of the ocean comes second,*\n"
        "> *the color of nature comes third,*\n"
        "> *and the color of the sun comes last.'*"
    )

    if "color_slots" not in st.session_state:
        st.session_state.color_slots = ["❓ Slot 1", "❓ Slot 2", "❓ Slot 3", "❓ Slot 4"]

    st.write(f"**Current Input Sequence:** {' ➔ '.join(st.session_state.color_slots)}")

    st.markdown("#### Choose Colors for Slots:")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        if st.button("🔴 RED", key="btn_col_red"):
            _add_color("🔴 RED")
    with c2:
        if st.button("🔵 BLUE", key="btn_col_blue"):
            _add_color("🔵 BLUE")
    with c3:
        if st.button("🟢 GREEN", key="btn_col_green"):
            _add_color("🟢 GREEN")
    with c4:
        if st.button("🟡 YELLOW", key="btn_col_yellow"):
            _add_color("🟡 YELLOW")

    c_sub, c_rst = st.columns(2)
    with c_sub:
        if st.button("🔓 Unlock Color Lock", key="btn_unlock_color", type="primary"):
            if st.session_state.color_slots == CORRECT_COLOR_SEQUENCE:
                st.success("🎉 Click! Color Lock Unlocked! (+100 Bonus Score)")
                if "color_lock_solved" not in st.session_state:
                    st.session_state.color_lock_solved = True
                    st.session_state.score += 100
            else:
                st.error("❌ Incorrect sequence! Follow the order: Fire -> Ocean -> Nature -> Sun.")
    with c_rst:
        if st.button("🔄 Reset Slots", key="btn_reset_color"):
            st.session_state.color_slots = ["❓ Slot 1", "❓ Slot 2", "❓ Slot 3", "❓ Slot 4"]
            st.rerun()

def _add_color(color_name: str):
    for i in range(4):
        if "❓" in st.session_state.color_slots[i]:
            st.session_state.color_slots[i] = color_name
            st.rerun()
            break
