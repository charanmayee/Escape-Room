# 🔐 AI Escape Room Game

An interactive, real-time puzzle-solving escape room game built with **Python, Streamlit, SQLite, and AI**. Players are trapped inside a multi-chamber facility and must find hidden clues, crack anagrams, solve decapitated word ciphers, outsmart AI sentinel riddles, decode visual rebuses, and balance matchstick equations before the 15-minute emergency countdown expires!

---

## 🌟 Key Features

* **5 Thematic Story-Driven Rooms**:
  * **Room 1 – Word Puzzle Room**: College & Student Life anagrams (`NPEYTHO`, `GLOCLEE`, `TNUDETS`, `TCOJERP`, `GIDCON`) with first-letter key generation (`PCSPC`).
  * **Room 2 – Decapitated Word Room**: Word pattern completion across Animals, Technology, Programming, and Objects with master key `ESCAPE2026`.
  * **Room 3 – AI Sentinel Chamber**: Dynamic AI-generated riddles (Easy, Medium, Hard) powered by OpenAI / Gemini with local fallback protection.
  * **Room 4 – Visual Rebus Gallery**: Visual and text wordplay puzzles yielding safe digits (`4827`).
  * **Room 5 – Matchstick & Logic Vault**: Fix broken equations (`6 + 4 = 4` ➔ `0 + 4 = 4`), solve Fibonacci sequence reasoning, and trigger emergency blast doors.
* **3 Bonus Practice Mini-Games**:
  * Interactive 4x4 Sudoku with row, column, and subgrid validation.
  * Chroma Sequence Lock with color-coded clues (Fire, Ocean, Nature, Sun).
  * Spot the Difference visual inspection matrix.
* **Hidden Clue System**: Interactive objects in every room (notebooks, coffee mugs, terminal screens, mirrors, neural dumps) to search before unlocking doors.
* **Real-Time Countdown Timer**: 15:00 countdown clock with automatic time bonus multipliers.
* **Adaptive Scoring & Hint System**:
  * 100 points on first attempt without hints.
  * 70 points after one hint.
  * 40 points on multiple attempts with hints.
  * +200 points per completed room & +500 points for full escape.
* **SQLite Persistence & Leaderboard**: Records top players, ranks, scores, remaining time, and completed rooms.
* **Docker & Docker Compose**: Instant containerized deployment with volume-mounted database persistence.

---

## 🛠 Technology Stack

* **Frontend & Game Engine**: Streamlit (Python) & React / Tailwind Web UI
* **Backend & AI Integration**: OpenAI API / Gemini API (`@google/genai`), Python Standard Library
* **Database**: SQLite3 / SQLAlchemy ORM
* **Containerization**: Docker & Docker Compose

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ai-escape-room.git
cd ai-escape-room
```

### 2. Create and activate a virtual environment
```bash
python -m venv venv
# On macOS / Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Add your API key (optional — game runs with built-in fallback riddles if omitted):
```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Launch the game
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 🐳 Docker Deployment

Run the entire application in a Docker container with persistent database storage:

### Using Docker Compose (Recommended)
```bash
docker compose up --build
```

### Using Docker CLI directly
```bash
docker build -t ai-escape-room .
docker run -p 8501:8501 --env-file .env -v $(pwd)/data:/app/data ai-escape-room
```

Access the game at `http://localhost:8501`.

---

## 📁 Project Folder Structure

```text
ai-escape-room/
│
├── app.py                     # Main Streamlit game controller & routing
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation & guides
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore file
├── Dockerfile                 # Container build definition
├── docker-compose.yml         # Container orchestration with volume storage
│
├── database/
│   ├── __init__.py
│   ├── db.py                  # Database connection, queries & leaderboard
│   └── models.py              # SQLAlchemy Player and GameScore models
│
├── games/
│   ├── __init__.py
│   ├── word_scramble.py       # Room 1: Campus Anagrams & Passcode
│   ├── decapitated_words.py   # Room 2: Masked Word Patterns & ESCAPE2026 Key
│   ├── riddles.py             # Room 3: AI Sentinel Riddle Chamber
│   ├── rebus.py               # Room 4: Visual Rebus Gallery & Combination Lock
│   ├── matchstick.py          # Room 5: Matchstick Equation & Logic Sequence
│   ├── sudoku.py              # Bonus 1: 4x4 Sudoku Mini-Game
│   ├── color_sequence.py      # Bonus 2: Chroma Sequence Lock
│   └── spot_difference.py     # Bonus 3: Security Terminal Difference Matrix
│
├── services/
│   ├── __init__.py
│   └── ai_service.py          # AI riddle generator, contextual hints & fallbacks
│
├── utils/
│   ├── __init__.py
│   ├── timer.py               # 15:00 Countdown calculator & formatters
│   ├── scoring.py             # Scoring rules, penalties & multipliers
│   └── game_state.py          # Streamlit session_state initializer & resets
│
└── data/
    ├── escape_room.db         # SQLite database file (auto-generated)
    └── fallback_puzzles.json  # Offline riddle and puzzle datasets
```

---

## 🎮 How to Play

1. **Enter Codename**: Type your player name and click **Initiate Escape Run**.
2. **Explore Rooms**: Click **Search Room for Hidden Clues** in each chamber to discover hints.
3. **Solve Room Puzzles**:
   - Solve all challenges in Room 1 to obtain first letters for the door code.
   - Decipher all patterns in Room 2 to receive the `ESCAPE2026` secret key.
   - Outwit the AI Sentinel in Room 3 with your answer.
   - Decode the Rebus cards in Room 4 for safe digits `4827`.
   - Correct the matchstick equation in Room 5 and identify the Fibonacci sequence.
4. **Beat the Clock**: Escape before the 15:00 countdown reaches zero to earn big time multipliers!
5. **View Leaderboard**: Check your rank and see how your score compares on the global leaderboard.

---

## 🛠 Troubleshooting & Tips

* **AI API Unavailable?** The game automatically switches to curated local fallback puzzles.
* **Database Reset?** Delete `data/escape_room.db` and the app will recreate clean tables on startup.
* **Port Conflict?** Run `streamlit run app.py --server.port=8502` if port 8501 is occupied.
