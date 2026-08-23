import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client if API key is present
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Ensure data folder and leaderboard storage
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const LEADERBOARD_PATH = path.join(DATA_DIR, "leaderboard.json");
if (!fs.existsSync(LEADERBOARD_PATH)) {
  const initialLeaderboard = [
    {
      player: "CyberSherlock",
      score: 1840,
      rooms_completed: 5,
      time_remaining: 520,
      completed_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      player: "AgentCipher",
      score: 1680,
      rooms_completed: 5,
      time_remaining: 410,
      completed_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      player: "NeoHacker",
      score: 1510,
      rooms_completed: 5,
      time_remaining: 320,
      completed_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      player: "ByteEnigma",
      score: 1390,
      rooms_completed: 4,
      time_remaining: 180,
      completed_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
  ];
  fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(initialLeaderboard, null, 2));
}

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Leaderboard
app.get("/api/leaderboard", (req, res) => {
  try {
    if (fs.existsSync(LEADERBOARD_PATH)) {
      const rawData = JSON.parse(fs.readFileSync(LEADERBOARD_PATH, "utf-8"));
      // Deduplicate by player name (case-insensitive), preserving highest score
      const playerMap = new Map<string, any>();
      for (const entry of rawData) {
        if (!entry || !entry.player) continue;
        const normalized = String(entry.player).trim().toLowerCase();
        const existing = playerMap.get(normalized);
        if (!existing) {
          playerMap.set(normalized, entry);
        } else {
          if (
            entry.score > existing.score ||
            (entry.score === existing.score && entry.rooms_completed > existing.rooms_completed) ||
            (entry.score === existing.score && entry.rooms_completed === existing.rooms_completed && entry.time_remaining > existing.time_remaining)
          ) {
            playerMap.set(normalized, entry);
          }
        }
      }

      const deduplicated = Array.from(playerMap.values());
      deduplicated.sort((a: any, b: any) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.rooms_completed !== a.rooms_completed) return b.rooms_completed - a.rooms_completed;
        return b.time_remaining - a.time_remaining;
      });
      return res.json({ leaderboard: deduplicated.slice(0, 10) });
    }
    return res.json({ leaderboard: [] });
  } catch (err) {
    console.error("Error reading leaderboard:", err);
    return res.status(500).json({ error: "Failed to read leaderboard" });
  }
});

app.post("/api/leaderboard", (req, res) => {
  try {
    const { player, score, rooms_completed, time_remaining, difficulty } = req.body;
    if (!player) {
      return res.status(400).json({ error: "Player name is required" });
    }
    let data: any[] = [];
    if (fs.existsSync(LEADERBOARD_PATH)) {
      try {
        data = JSON.parse(fs.readFileSync(LEADERBOARD_PATH, "utf-8"));
        if (!Array.isArray(data)) data = [];
      } catch {
        data = [];
      }
    }
    const cleanPlayer = String(player).trim();
    const newEntry = {
      player: cleanPlayer,
      score: Number(score) || 0,
      rooms_completed: Number(rooms_completed) || 0,
      time_remaining: Number(time_remaining) || 0,
      difficulty: difficulty && ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium",
      completed_at: new Date().toISOString(),
    };

    // Check if player already exists in leaderboard (case-insensitive)
    const existingIndex = data.findIndex(
      (e: any) => e && e.player && e.player.toLowerCase() === cleanPlayer.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = data[existingIndex];
      // Update entry if new run is better or equal
      if (
        newEntry.score > existing.score ||
        (newEntry.score === existing.score && newEntry.rooms_completed >= existing.rooms_completed && newEntry.time_remaining >= existing.time_remaining)
      ) {
        data[existingIndex] = newEntry;
      }
    } else {
      data.push(newEntry);
    }

    // Ensure entire list is strictly 1 entry per player
    const playerMap = new Map<string, any>();
    for (const entry of data) {
      if (!entry || !entry.player) continue;
      const normalized = String(entry.player).trim().toLowerCase();
      const existing = playerMap.get(normalized);
      if (!existing) {
        playerMap.set(normalized, entry);
      } else {
        if (
          entry.score > existing.score ||
          (entry.score === existing.score && entry.rooms_completed > existing.rooms_completed) ||
          (entry.score === existing.score && entry.rooms_completed === existing.rooms_completed && entry.time_remaining > existing.time_remaining)
        ) {
          playerMap.set(normalized, entry);
        }
      }
    }

    const cleanData = Array.from(playerMap.values());
    fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(cleanData, null, 2));
    return res.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error("Error saving score:", err);
    return res.status(500).json({ error: "Failed to save score" });
  }
});

// Curated high-variety offline fallback riddles
const FALLBACK_RIDDLES = [
  // Easy
  {
    difficulty: "Easy",
    theme: "Technology",
    question: "I have keys but no locks. I have a space but no room. You can enter, but you cannot go outside. What am I?",
    answer: "keyboard",
    hint: "You use it every day to type text, commands, and code.",
    explanation: "A computer keyboard has letter keys, space bar, and enter key.",
  },
  {
    difficulty: "Easy",
    theme: "Student Life",
    question: "I have a spine, but no bones. I have leaves, but no branches. I tell stories and teach algorithms without speaking. What am I?",
    answer: "book",
    hint: "You borrow hundreds of me from the college library.",
    explanation: "A book has a spine and pages (leaves).",
  },
  {
    difficulty: "Easy",
    theme: "Web Technology",
    question: "I am baked in code, stored in your browser, and remember your session preferences. What am I?",
    answer: "cookie",
    hint: "A sweet treat name used for HTTP client storage.",
    explanation: "HTTP cookies store stateful user session data in browsers.",
  },
  {
    difficulty: "Easy",
    theme: "Hardware",
    question: "I have no hands or feet, but I click and point where you direct on the screen. What am I?",
    answer: "mouse",
    hint: "A rodent-named computer peripheral.",
    explanation: "A computer mouse navigates the cursor on displays.",
  },
  // Medium
  {
    difficulty: "Medium",
    theme: "Artificial Intelligence",
    question: "I speak without a mouth and hear without ears. In terminal scripts, I print back whatever you send me. What am I?",
    answer: "echo",
    hint: "A shell command used in Bash/CLI to print strings.",
    explanation: "The 'echo' command outputs arguments to stdout.",
  },
  {
    difficulty: "Medium",
    theme: "Network Security",
    question: "I stand as a fiery wall between your network and the outside world, filtering incoming and outgoing packets. What am I?",
    answer: "firewall",
    hint: "A digital security barrier protecting against unauthorized access.",
    explanation: "A firewall inspects and monitors network traffic based on security rules.",
  },
  {
    difficulty: "Medium",
    theme: "Cloud Computing",
    question: "I float without rain, store petabytes without hard ground, and serve servers from anywhere on Earth. What am I?",
    answer: "cloud",
    hint: "Remote compute and data storage infrastructure.",
    explanation: "The cloud refers to distributed servers and storage accessed via internet.",
  },
  {
    difficulty: "Medium",
    theme: "Data Structures",
    question: "Last one in is first one out. I hold function calls and recursive traces until they pop off. What am I?",
    answer: "stack",
    hint: "LIFO data structure.",
    explanation: "A stack operates on Last-In, First-Out order.",
  },
  // Hard
  {
    difficulty: "Hard",
    theme: "Cryptography",
    question: "I am a secret wrapped in math. Shift me by 3 and Caesar smiles; hash me with SHA and I can never return. What am I?",
    answer: "cipher",
    hint: "An encryption algorithm used to protect data.",
    explanation: "A cipher encrypts plaintext into protected ciphertext.",
  },
  {
    difficulty: "Hard",
    theme: "Algorithms",
    question: "To understand me, you must first understand me. I call upon myself until a base condition releases the call stack. What am I?",
    answer: "recursion",
    hint: "A programming technique where a function calls itself.",
    explanation: "Recursion solves problems by dividing into smaller self-referential subproblems.",
  },
  {
    difficulty: "Hard",
    theme: "Computer Architecture",
    question: "I am lightning fast and live right next to the CPU cores. When I miss, main memory must pay the latency penalty. What am I?",
    answer: "cache",
    hint: "High-speed SRAM memory layer (L1, L2, L3).",
    explanation: "CPU cache stores frequently accessed data for instant retrieval.",
  },
  {
    difficulty: "Hard",
    theme: "Operating Systems",
    question: "I am the heart of the operating system. I manage memory, CPU scheduling, and hardware drivers with supreme privilege in ring 0. What am I?",
    answer: "kernel",
    hint: "The fundamental core software module of Linux or Unix.",
    explanation: "The kernel manages system resources and hardware interaction.",
  },
];

function getRandomFallbackRiddle(diff: string) {
  const normalized = (diff || "Medium").toLowerCase();
  const matching = FALLBACK_RIDDLES.filter((r) => r.difficulty.toLowerCase() === normalized);
  const pool = matching.length > 0 ? matching : FALLBACK_RIDDLES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// API: Gemini Dynamic Riddle Generator with automatic retry and model fallback
app.post("/api/gemini/riddle", async (req, res) => {
  const { difficulty = "Medium", theme = "Technology and Artificial Intelligence" } = req.body;

  const ai = getGeminiClient();
  if (ai) {
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Generate one clever escape room riddle.
Theme: ${theme}
Difficulty: ${difficulty}
The riddle should have a single lowercase word or short phrase answer (1-2 words).
Return strictly JSON adhering to the schema.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "The riddle question" },
                answer: { type: Type.STRING, description: "Single word or short phrase answer in lowercase" },
                hint: { type: Type.STRING, description: "A clever clue that guides without giving it away" },
                explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct" },
                difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
                theme: { type: Type.STRING, description: "Theme" },
              },
              required: ["question", "answer", "hint", "explanation"],
            },
          },
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        if (parsed.question && parsed.answer) {
          return res.json({
            riddle: {
              question: parsed.question,
              answer: parsed.answer.toLowerCase().trim(),
              hint: parsed.hint || "Think about computer science concepts.",
              explanation: parsed.explanation || "Correct answer deduced by riddle clues.",
              difficulty: parsed.difficulty || difficulty,
              theme: parsed.theme || theme,
            },
            source: "gemini",
          });
        }
      } catch (err: any) {
        // Log clean notice and try fallback model or offline backup
        const errMsg = err?.message || String(err);
        console.warn(`Gemini (${modelName}) unavailable (${errMsg.slice(0, 80)}...), attempting fallback.`);
      }
    }
  }

  const fallback = getRandomFallbackRiddle(difficulty);
  return res.json({ riddle: fallback, source: "fallback" });
});

// API: Gemini Contextual Hint with resilient fallback
app.post("/api/gemini/hint", async (req, res) => {
  const { room, puzzleTitle, puzzleDetail } = req.body;
  const ai = getGeminiClient();
  if (ai) {
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `You are the master AI of an escape room game.
The player is stuck in: ${room}
Puzzle: ${puzzleTitle}
Details: ${puzzleDetail}

Provide a single, witty, helpful one-sentence clue that guides the player toward the answer without directly spoiling the password or word. Keep it under 25 words.`,
        });
        const hintText = response.text?.trim();
        if (hintText) {
          return res.json({ hint: hintText });
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.warn(`Gemini hint (${modelName}) transient status (${errMsg.slice(0, 60)}...).`);
      }
    }
  }
  return res.json({ hint: "Look carefully at the patterns, first letters, or mathematical sequences in this chamber!" });
});

// API: Secure Puzzle Verification (Keep validation server-side without leaking answers)
app.post("/api/puzzles/verify", (req, res) => {
  try {
    const { room, puzzleId, answer } = req.body;
    if (room === undefined || puzzleId === undefined || answer === undefined) {
      return res.status(400).json({ error: "Missing verification parameters" });
    }

    const cleanAnswer = String(answer).trim().toUpperCase();
    const pid = String(puzzleId).trim().toLowerCase();
    const roomNum = Number(room);

    let isCorrect = false;

    // Room 1: Word Scramble
    if (roomNum === 1 || room === "1") {
      const room1Answers: Record<string, string[]> = {
        w1: ["PYTHON"],
        w2: ["COLLEGE"],
        w3: ["STUDENT"],
        w4: ["PROJECT"],
        w5: ["CODING"],
        "1": ["PYTHON"],
        "2": ["COLLEGE"],
        "3": ["STUDENT"],
        "4": ["PROJECT"],
        "5": ["CODING"],
        door: ["PCSPC"],
      };
      const valid = room1Answers[pid] || [];
      isCorrect = valid.includes(cleanAnswer);
    }
    // Room 2: Decapitated Words
    else if (roomNum === 2 || room === "2") {
      const room2Answers: Record<string, string[]> = {
        d1: ["CAMPUS", "CAT", "CATS"],
        d2: ["LIBRARY", "PYTHON"],
        d3: ["ALGORITHM", "ROBOT"],
        d4: ["DATABASE", "LAPTOP"],
        d5: ["SEMESTER", "COMPILER"],
        "1": ["CAMPUS", "CAT", "CATS"],
        "2": ["LIBRARY", "PYTHON"],
        "3": ["ALGORITHM", "ROBOT"],
        "4": ["DATABASE", "LAPTOP"],
        "5": ["SEMESTER", "COMPILER"],
        door: ["ESCAPE2026", "PCSPC"],
      };
      const valid = room2Answers[pid] || [];
      isCorrect = valid.includes(cleanAnswer);
    }
    // Room 4: Visual Rebus
    else if (roomNum === 4 || room === "4") {
      const room4Answers: Record<string, string[]> = {
        r1: ["TRICYCLE", "A TRICYCLE", "TRI CYCLE", "TRI-CYCLE"],
        r2: ["MAN OVERBOARD", "MAN OVER BOARD", "MAN-OVERBOARD"],
        r3: ["I UNDERSTAND", "UNDERSTAND", "I-UNDERSTAND", "FORGET IT", "FORGET-IT", "FORGETIT"],
        r4: ["THREE BLIND MICE", "3 BLIND MICE", "NEON LIGHTS", "NEON LIGHT", "NEON-LIGHTS"],
        "1": ["TRICYCLE", "A TRICYCLE", "TRI CYCLE", "TRI-CYCLE"],
        "2": ["MAN OVERBOARD", "MAN OVER BOARD", "MAN-OVERBOARD"],
        "3": ["I UNDERSTAND", "UNDERSTAND", "I-UNDERSTAND", "FORGET IT", "FORGET-IT", "FORGETIT"],
        "4": ["THREE BLIND MICE", "3 BLIND MICE", "NEON LIGHTS", "NEON LIGHT", "NEON-LIGHTS"],
        safe: ["4827"],
      };
      const validAnswers = room4Answers[pid] || [];
      const stripStr = (s: string) => s.replace(/[\s-_]/g, "");
      isCorrect = validAnswers.some((val) => val === cleanAnswer || stripStr(val) === stripStr(cleanAnswer));
    }
    // Room 5: Matchstick & Fibonacci
    else if (roomNum === 5 || room === "5") {
      if (pid === "match" || pid === "1") {
        const norm = cleanAnswer.replace(/[\s\u2212\u2013]/g, (m) => (m === "-" || m === "\u2212" || m === "\u2013" ? "-" : ""));
        const valid = ["0+4=4", "5+4=9", "6-4=2", "8-4=4"];
        isCorrect = valid.includes(norm);
      } else if (pid === "sequence" || pid === "2") {
        isCorrect = cleanAnswer === "21";
      }
    }
    // Bonus puzzles
    else if (room === "bonus") {
      if (pid === "color" || pid === "chroma") {
        isCorrect = cleanAnswer.includes("CYAN") || cleanAnswer.length > 0;
      } else if (pid === "spot" || pid === "sudoku") {
        isCorrect = true;
      }
    }

    return res.json({ correct: isCorrect });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// Vite middleware for development & Static file serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Escape Room server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
