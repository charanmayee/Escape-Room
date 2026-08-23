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

// API: Gemini Dynamic Riddle Generator
app.post("/api/gemini/riddle", async (req, res) => {
  const { difficulty = "Medium", theme = "Technology and Artificial Intelligence" } = req.body;

  // Curated fallbacks
  const fallbacks = [
    {
      difficulty: "Easy",
      theme: "Technology",
      question: "I have keys but no locks. I have a space but no room. You can enter, but you cannot go outside. What am I?",
      answer: "keyboard",
      hint: "You use it to write code and type messages.",
      explanation: "A computer keyboard contains letters, an enter key, and a space bar.",
    },
    {
      difficulty: "Medium",
      theme: "Artificial Intelligence",
      question: "I speak without a mouth and hear without ears. In programming, I repeat whatever you tell me into the terminal. What am I?",
      answer: "echo",
      hint: "A shell command used in Bash to print output.",
      explanation: "The 'echo' command prints passed arguments to standard output.",
    },
    {
      difficulty: "Hard",
      theme: "Cryptography",
      question: "I am a secret wrapped in math. Shift me by 3 and Caesar smiles; hash me with SHA and I can never return. What am I?",
      answer: "cipher",
      hint: "An encryption algorithm used to protect data.",
      explanation: "A cipher encrypts plaintext into protected ciphertext.",
    },
    {
      difficulty: "Easy",
      theme: "Student Life",
      question: "I have a spine, but no bones. I have leaves, but no branches. I tell stories without speaking. What am I?",
      answer: "book",
      hint: "You borrow hundreds of me from the college library.",
      explanation: "A book has a spine and pages (leaves), holding knowledge.",
    },
  ];

  try {
    const ai = getGeminiClient();
    if (!ai) {
      const match = fallbacks.find((f) => f.difficulty.toLowerCase() === difficulty.toLowerCase()) || fallbacks[1];
      return res.json({ riddle: match, source: "fallback" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
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
  } catch (err) {
    console.error("Gemini riddle error:", err);
  }

  const match = fallbacks.find((f) => f.difficulty.toLowerCase() === difficulty.toLowerCase()) || fallbacks[1];
  return res.json({ riddle: match, source: "fallback" });
});

// API: Gemini Contextual Hint
app.post("/api/gemini/hint", async (req, res) => {
  const { room, puzzleTitle, puzzleDetail } = req.body;
  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `You are the master AI of an escape room game.
The player is stuck in: ${room}
Puzzle: ${puzzleTitle}
Details: ${puzzleDetail}

Provide a single, witty, helpful one-sentence clue that guides the player toward the answer without directly spoiling the password or word. Keep it under 25 words.`,
      });
      return res.json({ hint: response.text?.trim() });
    }
  } catch (err) {
    console.error("Gemini hint error:", err);
  }
  return res.json({ hint: "Look carefully at the patterns, first letters, or mathematical sequences!" });
});

// API: Secure Puzzle Verification (Keep validation server-side without leaking answers)
app.post("/api/puzzles/verify", (req, res) => {
  try {
    const { room, puzzleId, answer } = req.body;
    if (!room || !puzzleId || answer === undefined) {
      return res.status(400).json({ error: "Missing verification parameters" });
    }

    const cleanAnswer = String(answer).trim().toUpperCase();

    let isCorrect = false;

    // Room 1: Word Scramble
    if (room === 1) {
      const room1Answers: Record<string, string> = {
        w1: "PYTHON",
        w2: "COLLEGE",
        w3: "STUDENT",
        w4: "PROJECT",
        w5: "CODING",
        door: "PCSPC",
      };
      isCorrect = room1Answers[puzzleId] === cleanAnswer;
    }
    // Room 2: Decapitated Words
    else if (room === 2) {
      const room2Answers: Record<string, string> = {
        d1: "CAMPUS",
        d2: "LIBRARY",
        d3: "ALGORITHM",
        d4: "DATABASE",
        d5: "SEMESTER",
        door: "ESCAPE2026",
      };
      isCorrect = room2Answers[puzzleId] === cleanAnswer;
    }
    // Room 4: Visual Rebus
    else if (room === 4) {
      const room4Answers: Record<string, string[]> = {
        r1: ["TRICYCLE", "A TRICYCLE", "TRI CYCLE"],
        r2: ["MAN OVERBOARD", "MAN OVER BOARD"],
        r3: ["FORGET IT", "FORGET-IT"],
        r4: ["NEON LIGHTS", "NEON LIGHT"],
        safe: ["4827"],
      };
      const validAnswers = room4Answers[puzzleId] || [];
      isCorrect = validAnswers.some((val) => val === cleanAnswer || cleanAnswer.includes(val));
    }
    // Room 5: Matchstick & Fibonacci
    else if (room === 5) {
      if (puzzleId === "match") {
        const norm = cleanAnswer.replace(/\s+/g, "");
        isCorrect = norm === "0+4=4" || norm === "8-4=4";
      } else if (puzzleId === "sequence") {
        isCorrect = cleanAnswer === "21";
      }
    }
    // Bonus puzzles
    else if (room === "bonus") {
      if (puzzleId === "color") {
        isCorrect = cleanAnswer === "CYAN,AMBER,ROSE,EMERALD" || cleanAnswer === "CYAN, AMBER, ROSE, EMERALD";
      } else if (puzzleId === "spot") {
        isCorrect = cleanAnswer === "DIF3" || cleanAnswer === "CIRCUIT 3" || cleanAnswer === "3";
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
