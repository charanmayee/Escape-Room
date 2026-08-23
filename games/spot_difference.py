"""
Bonus Mini-Game: Spot the Difference (Visual / Text Matrix)
Features side-by-side matrices/representations with 3 distinct subtle differences.
"""

import streamlit as st

IMAGE_A_ASCII = """
+-----------------------+
|  [AI LAB SECURITY]    |
|  * Server #1: ONLINE  |
|  * Door Lock: CLOSED  |
|  * Keypad: 4 Digits   |
|  * Sensor: [ACTIVE]   |
|  * Camera: 1080p (ON) |
+-----------------------+
"""

IMAGE_B_ASCII = """
+-----------------------+
|  [AI LAB SECURITY]    |
|  * Server #1: OFFLINE | <-- Diff 1
|  * Door Lock: CLOSED  |
|  * Keypad: 6 Digits   | <-- Diff 2
|  * Sensor: [ACTIVE]   |
|  * Camera: 720p (ON)  | <-- Diff 3
+-----------------------+
"""

def render_spot_difference():
    st.markdown("### 👁 Spot the Difference Matrix")
    st.info("Inspect the two security terminal readouts side by side. How many subtle discrepancies or differences can you spot?")

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Terminal Feed Alpha**")
        st.code(IMAGE_A_ASCII, language="text")
    with c2:
        st.markdown("**Terminal Feed Beta**")
        st.code(IMAGE_B_ASCII, language="text")

    diff_count = st.number_input("How many total differences did you find?", min_value=0, max_value=10, value=0, key="spot_diff_count")

    c_sub, c_hint = st.columns(2)
    with c_sub:
        if st.button("Submit Difference Count", key="btn_spot_diff_submit"):
            if diff_count == 3:
                st.success("🎉 Exactly 3 differences! (Server status, Keypad digits, Camera resolution) (+100 Bonus Score)")
                if "spot_diff_solved" not in st.session_state:
                    st.session_state.spot_diff_solved = True
                    st.session_state.score += 100
            else:
                st.error("❌ Not quite! Look closely at Server status, Keypad digits, and Camera resolution.")
    with c_hint:
        if st.button("💡 Spot Clue", key="btn_spot_diff_hint"):
            st.caption("Hint: Check the second line, fourth line, and sixth line.")
