"""
Bonus Mini-Game: 4x4 Mini Sudoku Puzzle
Rules:
- Each row contains digits 1-4
- Each column contains digits 1-4
- Each 2x2 subgrid contains digits 1-4
Solution grid:
[1, 2, 3, 4]
[3, 4, 1, 2]
[2, 1, 4, 3]
[4, 3, 2, 1]
"""

import streamlit as st

SOLUTION_GRID = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
]

INITIAL_GIVEN = [
    [1, None, 3, None],
    [None, 4, None, 2],
    [2, None, 4, None],
    [None, 3, None, 1]
]

def render_sudoku():
    st.markdown("### 🔢 4x4 Sudoku Mini-Challenge")
    st.info("Fill each cell with numbers 1 to 4 so every row, column, and 2x2 box contains all digits without repetition.")

    col1, col2, col3, col4 = st.columns(4)
    cols = [col1, col2, col3, col4]

    user_values = []
    for r in range(4):
        row_vals = []
        for c in range(4):
            given = INITIAL_GIVEN[r][c]
            with cols[c]:
                if given is not None:
                    st.text_input(f"Cell {r},{c}", value=str(given), disabled=True, key=f"sdk_{r}_{c}")
                    row_vals.append(given)
                else:
                    v = st.selectbox(f"Cell {r},{c}", [1, 2, 3, 4], key=f"sdk_input_{r}_{c}", label_visibility="collapsed")
                    row_vals.append(v)
        user_values.append(row_vals)

    c_btn, c_hint = st.columns(2)
    with c_btn:
        if st.button("✅ Validate Sudoku Solution", key="validate_sudoku_btn"):
            if user_values == SOLUTION_GRID:
                st.success("🎉 Correct! Master key fragment obtained: `SUDOKU_MASTER_77` (+150 Bonus Score)")
                if "sudoku_solved" not in st.session_state:
                    st.session_state.sudoku_solved = True
                    st.session_state.score += 150
            else:
                st.error("❌ Some numbers violate row, column, or 2x2 box constraints. Check and retry!")
    with c_hint:
        if st.button("💡 Sudoku Hint", key="sudoku_hint_btn"):
            st.warning("Row 1: [1, 2, 3, 4]. Box 1 (top-left) contains 1, 2, 3, 4!")
