# 🔐 AI Escape Room Game

An interactive, real-time puzzle-solving escape room game built with **React, TypeScript, Vite, Tailwind CSS, and Express**. Players are trapped inside a multi-chamber facility and must find hidden clues, crack anagrams, solve decapitated word ciphers, outsmart AI sentinel riddles, decode visual rebuses, and balance matchstick equations before the emergency countdown expires!

---

## 🌟 Key Features

* **5 Thematic Story-Driven Rooms**:
  * **Room 1 – Word Puzzle Room**: College & Student Life anagrams (`N P Y T H O`, `G L O C L E E`, `T N U D E T S`, `T C O J E R P`, `G I D C O N`) with first-letter master key generation (`PCSPC`).
  * **Room 2 – Decapitated Word Room**: Word pattern completion across Animals, Technology, Programming, and Objects with master key `ESCAPE2026`.
  * **Room 3 – AI Sentinel Chamber**: Dynamic AI-generated riddles (Easy, Medium, Hard) powered by Gemini API with multi-model fallback and curated offline puzzle protection.
  * **Room 4 – Visual Rebus Gallery**: Visual and text wordplay puzzles yielding safe digits (`4827`).
  * **Room 5 – Matchstick & Logic Vault**: Fix broken equations (`6 + 4 = 4` ➔ `0 + 4 = 4`), solve Fibonacci sequence reasoning, and trigger emergency blast doors.
* **3 Bonus Practice Mini-Games**:
  * Interactive 4x4 Sudoku with row, column, and subgrid validation.
  * Chroma Sequence Lock with color-coded clues (Fire, Ocean, Nature, Sun).
  * Spot the Difference visual inspection matrix.
* **Hidden Clue Inspection**: Interactive objects in every room (notebooks, coffee mugs, terminal screens, mirrors, neural dumps) to search before unlocking doors.
* **Real-Time Countdown Timer & Sound FX**: Atmospheric procedural sound effects, ticking timer alerts, and difficulty scaling multipliers ($1.0\times, 1.5\times, 2.0\times$).
* **Global Leaderboard & Persistence**: Real-time score tracking, room completion logging, and ranking system.
* **Containerized Deployment**: Ready for Cloud Run and Docker deployment.

---

## 🛠 Technology Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion, Canvas-Confetti
* **Backend**: Node.js, Express, `@google/genai` Gemini SDK
* **Persistence**: Local JSON / SQLite storage & REST API
* **Build Tools**: Vite, esbuild, tsx, TypeScript

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ai-escape-room.git
cd ai-escape-room
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (Optional)
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Add your Gemini API key (optional — game includes high-variety fallback riddles if omitted):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Launch in development mode
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build and run in production
```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

Run the containerized application:

### Using Docker
```bash
docker build -t ai-escape-room .
docker run -p 3000:3000 --env-file .env ai-escape-room
```

Access the game at `http://localhost:3000`.

---

## 📁 Project Folder Structure

```text
ai-escape-room/
│
├── src/                       # React frontend source code
│   ├── App.tsx                # Main escape room game controller
│   ├── components/            # Thematic room components & modals
│   │   ├── Room1WordScramble.tsx
│   │   ├── Room2Decapitated.tsx
│   │   ├── Room3AIRiddle.tsx
│   │   ├── Room4Rebus.tsx
│   │   ├── Room5Matchstick.tsx
│   │   ├── BonusPracticeRooms.tsx
│   │   ├── LeaderboardView.tsx
│   │   └── VictoryModal.tsx
│   ├── types.ts               # Shared TypeScript data models & interfaces
│   ├── index.css              # Tailwind styling & animations
│   └── utils/                 # Sound synthesis, timers & helpers
│
├── server.ts                  # Express server & Gemini API routes
├── package.json               # Node.js dependencies & scripts
├── tsconfig.json              # TypeScript compilation config
├── vite.config.ts             # Vite frontend configuration
├── Dockerfile                 # Container build definition
├── data/                      # Leaderboard & fallback datasets
└── database/ & services/      # Python utilities & backend services
```

---

## 🎮 How to Play

1. **Enter Codename & Select Difficulty**: Type your player name, choose Easy, Medium, or Hard difficulty, and click **Initiate Escape Run**.
2. **Explore Rooms**: Click **Search Room for Hidden Clues** in each chamber to discover key notes.
3. **Solve Room Puzzles**:
   - Solve all anagrams in Room 1 to obtain first letters for the door code (`PCSPC`).
   - Decipher all patterns in Room 2 to receive the `ESCAPE2026` secret key.
   - Outwit the AI Sentinel in Room 3 with your answer.
   - Decode the Rebus cards in Room 4 for safe digits (`4827`).
   - Correct the matchstick equation in Room 5 and identify the Fibonacci sequence (`21`).
4. **Beat the Clock**: Escape before the countdown reaches zero to earn big time multipliers!
5. **View Leaderboard**: Check your rank and see how your score compares on the global leaderboard.
