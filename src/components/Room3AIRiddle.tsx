import React, { useState, useEffect, useRef } from "react";
import { Cpu, Search, Sparkles, HelpCircle, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { playSuccessChime, playDoorUnlockSound, playErrorBuzzer, playClueFoundSound, playKeyClickSound } from "../utils/audio";
import { ClueItem, RiddleData, DifficultyLevel } from "../types";

interface Room3Props {
  onUnlockRoom: (nextRoom: number, earnedPoints: number) => void;
  onDiscoverClue: (clue: ClueItem) => void;
  discoveredClues: ClueItem[];
  difficulty?: DifficultyLevel;
}

const CLIENT_BACKUP_RIDDLES: Record<DifficultyLevel, RiddleData[]> = {
  Easy: [
    {
      difficulty: "Easy",
      theme: "Computer Hardware",
      question: "I have keys but no locks. I have a space but no room. You can enter, but you cannot go outside. What am I?",
      answer: "keyboard",
      hint: "You use it every day to type text, commands, and code into your machine.",
      explanation: "A computer keyboard contains letters, a spacebar, and the Enter key.",
    },
    {
      difficulty: "Easy",
      theme: "Web Technology",
      question: "I am baked in code, stored in your browser, and remember your session preferences. What am I?",
      answer: "cookie",
      hint: "A sweet treat name used for HTTP client storage and tracking.",
      explanation: "HTTP cookies store stateful user session data locally.",
    },
    {
      difficulty: "Easy",
      theme: "Computer Peripherals",
      question: "I have no hands or feet, but I click and point where you direct on the screen. What am I?",
      answer: "mouse",
      hint: "A rodent-named computer peripheral on your desktop desk.",
      explanation: "A computer mouse navigates the cursor across graphic interfaces.",
    },
  ],
  Medium: [
    {
      difficulty: "Medium",
      theme: "Artificial Intelligence",
      question: "I speak without a mouth and hear without ears. In terminal scripts, I print back whatever you send me. What am I?",
      answer: "echo",
      hint: "A shell command used in Bash/CLI to print strings to stdout.",
      explanation: "The 'echo' command outputs arguments directly to stdout.",
    },
    {
      difficulty: "Medium",
      theme: "Network Security",
      question: "I stand as a digital barrier between your network and the outside world, filtering incoming and outgoing packets. What am I?",
      answer: "firewall",
      hint: "A digital security shield preventing unauthorized network ingress.",
      explanation: "A firewall monitors and inspects network traffic based on security protocols.",
    },
    {
      difficulty: "Medium",
      theme: "Data Structures",
      question: "Last one in is first one out. I hold function calls and recursive traces until they pop off. What am I?",
      answer: "stack",
      hint: "LIFO (Last-In, First-Out) data structure.",
      explanation: "A stack operates on Last-In, First-Out call execution ordering.",
    },
    {
      difficulty: "Medium",
      theme: "Cloud Computing",
      question: "I float without rain, store petabytes without hard ground, and serve servers anywhere on Earth. What am I?",
      answer: "cloud",
      hint: "Distributed computing infrastructure accessed via internet.",
      explanation: "Cloud computing refers to on-demand availability of computer system resources.",
    },
  ],
  Hard: [
    {
      difficulty: "Hard",
      theme: "Cryptography",
      question: "I am a secret wrapped in math. Shift me by 3 and Caesar smiles; hash me with SHA-256 and I can never return. What am I?",
      answer: "cipher",
      hint: "An encryption algorithm used to protect plain text.",
      explanation: "A cipher transforms plaintext into secure ciphertext.",
    },
    {
      difficulty: "Hard",
      theme: "Programming Paradigms",
      question: "To understand me, you must first understand me. I call upon myself until a base condition releases the stack. What am I?",
      answer: "recursion",
      hint: "A function that solves problems by invoking itself repeatedly.",
      explanation: "Recursion is a programming technique where a method calls itself.",
    },
    {
      difficulty: "Hard",
      theme: "Computer Architecture",
      question: "I am lightning fast and live right next to the CPU cores. When I miss, main memory must pay the latency penalty. What am I?",
      answer: "cache",
      hint: "High-speed SRAM layer (L1, L2, L3) inside microprocessors.",
      explanation: "CPU cache stores memory blocks for ultra low-latency instruction execution.",
    },
    {
      difficulty: "Hard",
      theme: "Operating Systems",
      question: "I am the heart of the operating system. I manage memory, CPU scheduling, and hardware drivers with supreme privilege in ring 0. What am I?",
      answer: "kernel",
      hint: "The fundamental core software module of Linux or Unix.",
      explanation: "The kernel provides core OS services and resource arbitration.",
    },
  ],
};

function getLocalRiddle(diff: DifficultyLevel): RiddleData {
  const list = CLIENT_BACKUP_RIDDLES[diff] || CLIENT_BACKUP_RIDDLES["Medium"];
  return list[Math.floor(Math.random() * list.length)];
}

export const Room3AIRiddle: React.FC<Room3Props> = (props: Room3Props) => {
  const { onUnlockRoom, onDiscoverClue, discoveredClues: _clues, difficulty = "Medium" } = props;
  const initialDiff: DifficultyLevel = difficulty === "Easy" || difficulty === "Hard" ? difficulty : "Medium";
  const [currentDiff, setCurrentDiff] = useState<DifficultyLevel>(initialDiff);
  const [riddle, setRiddle] = useState<RiddleData>(() => getLocalRiddle(initialDiff));
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRiddle = async (diff: DifficultyLevel) => {
    // Reset state for new puzzle
    setUserAnswer("");
    setAttempts(0);
    setHintUsed(false);
    setSolved(false);
    setErrorMessage("");
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set a timeout to abort if slow
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 4000);

    try {
      const res = await fetch("/api/gemini/riddle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: diff, theme: "Technology and Artificial Intelligence" }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.riddle && data.riddle.question && data.riddle.answer) {
          setRiddle(data.riddle);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Clean fallback if aborted or network issue
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }

    // Ensure we have a valid backup riddle if fetch failed
    setRiddle((prev) => (prev && prev.question ? prev : getLocalRiddle(diff)));
  };

  useEffect(() => {
    const targetDiff: DifficultyLevel = difficulty === "Easy" || difficulty === "Hard" ? difficulty : "Medium";
    setCurrentDiff(targetDiff);
    setRiddle(getLocalRiddle(targetDiff));
    fetchRiddle(targetDiff);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [difficulty]);

  const handleInspect = (clueId: string, name: string, icon: string, text: string) => {
    playClueFoundSound();
    onDiscoverClue({
      id: clueId,
      roomNumber: 3,
      name,
      icon,
      text,
      discovered: true,
    });
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riddle || solved) return;
    playKeyClickSound();

    const cleanInput = userAnswer.trim().toLowerCase();
    const cleanAnswer = riddle.answer.trim().toLowerCase();

    setAttempts((prev) => prev + 1);

    // Matching logic (exact match with tolerance for articles, punctuation, and plurals)
    const normalize = (s: string) =>
      s
        .replace(/^(a|an|the)\s+/i, "")
        .replace(/[^a-z0-9]/g, "")
        .replace(/s$/, ""); // normalize plural 's'

    const inNorm = normalize(cleanInput);
    const ansNorm = normalize(cleanAnswer);

    const isMatch =
      cleanInput === cleanAnswer ||
      (inNorm.length > 0 && inNorm === ansNorm) ||
      (ansNorm.length >= 4 && inNorm.includes(ansNorm)) ||
      (inNorm.length >= 4 && ansNorm.includes(inNorm));

    if (isMatch) {
      playSuccessChime();
      setSolved(true);
      setErrorMessage("");
    } else {
      playErrorBuzzer();
      setErrorMessage(`Incorrect entry. The AI Sentinel rejects your query (Attempt #${attempts + 1}).`);
      setTimeout(() => setErrorMessage(""), 3500);
    }
  };

  const handleProceedToRoom4 = () => {
    playDoorUnlockSound();
    let pts = 100;
    if (hintUsed && attempts <= 2) pts = 70;
    else if (hintUsed || attempts > 2) pts = 40;
    else pts = 100;

    onUnlockRoom(4, pts + 200);
  };

  const activeRiddle = riddle || getLocalRiddle(currentDiff);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Room Header Story */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
          Room 3: <span className="font-bold text-amber-500 italic">The Neural Riddle</span>
        </h2>
        <p className="text-[#9ca3af] text-xs sm:text-sm leading-relaxed max-w-2xl">
          The AI Sentinel has locked the central corridor firewall. To pass, you must prove your logical processing power by solving the dynamic neural riddle generated by the core processor.
        </p>
      </div>

      {/* Clues Search Drawer & Inspection Cards */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-4 sm:p-5 relative shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-mono">
              Chamber Environment // Surveillance
            </span>
          </div>

          <button
            id="room3_search_toggle_btn"
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#222533] text-[#e0e0e0] text-xs font-semibold uppercase tracking-wider transition border border-[#2d2d3d]"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>{showSearch ? "Hide Chamber Search" : "Inspect Neural Objects"}</span>
          </button>
        </div>

        {showSearch && (
          <div className="mt-4 pt-4 border-t border-[#2d2d3d] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2">
            <div
              id="room3_clue_dump_btn"
              onClick={() =>
                handleInspect(
                  "r3_dump",
                  "Neural Memory Core",
                  "💾",
                  "System buffer log: 'Answers are usually 1 or 2 word common computer/tech nouns.'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">💾</div>
              <div>
                <p className="text-xs font-bold text-white">Neural Memory Dump</p>
                <p className="text-[10px] text-[#6b7280]">Extract unencrypted logs from RAM buffer.</p>
              </div>
            </div>

            <div
              id="room3_clue_projector_btn"
              onClick={() =>
                handleInspect(
                  "r3_projector",
                  "Holographic Projector",
                  "🔮",
                  "Hologram frequency: 'You can adjust riddle difficulty or request hints if stuck!'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">🔮</div>
              <div>
                <p className="text-xs font-bold text-white">Holographic Projector</p>
                <p className="text-[10px] text-[#6b7280]">Calibrate floating prism emitter.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Guardian Terminal Card */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-6 sm:p-10 shadow-2xl relative space-y-6">
        <div className="absolute -top-3 left-10 px-3 py-1 bg-amber-500 text-[#0a0b10] text-[10px] font-bold rounded uppercase tracking-tighter">
          Incoming Transmission...
        </div>

        {/* Difficulty & Regeneration Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 border-b border-[#2d2d3d]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] font-mono">
              Core Level:
            </span>
            <div className="inline-flex rounded bg-[#0a0b10] border border-[#2d2d3d] p-0.5 text-xs font-mono">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setCurrentDiff(d);
                    fetchRiddle(d);
                  }}
                  className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition ${
                    currentDiff === d
                      ? "bg-amber-500 text-[#0a0b10] shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      : "text-[#9ca3af] hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            id="room3_regen_riddle_btn"
            onClick={() => fetchRiddle(currentDiff)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#222533] text-amber-400 text-xs font-mono font-bold uppercase tracking-wider border border-[#2d2d3d] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>{loading ? "Generating..." : "New Riddle"}</span>
          </button>
        </div>

        {/* Riddle Display Card */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Cpu className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs text-amber-400 font-mono uppercase tracking-widest">
              Synthesizing Neural Riddle with Gemini AI...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#6b7280] font-mono">
                <span className="flex items-center gap-1.5 text-amber-500 uppercase tracking-widest text-[10px]">
                  <Sparkles className="w-3.5 h-3.5" /> Neural Subject: {activeRiddle.theme}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0a0b10] border border-[#2d2d3d] text-white text-[10px] uppercase font-bold">
                  {currentDiff} Matrix
                </span>
              </div>

              <div className="font-mono text-lg sm:text-xl text-center leading-relaxed text-amber-100 italic py-4">
                &ldquo;{activeRiddle.question}&rdquo;
              </div>

              {hintUsed && (
                <div className="p-3 rounded bg-[#1a1c25] border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-in fade-in font-mono">
                  <HelpCircle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-amber-400">Decryption Clue: </span>
                    {activeRiddle.hint}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Form */}
            {!solved ? (
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="room3_riddle_answer_input" className="text-[10px] uppercase tracking-widest text-[#6b7280] ml-1 font-mono">
                    Neural Decryption Entry
                  </label>
                  <input
                    id="room3_riddle_answer_input"
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="TYPE YOUR ANSWER (E.G. KEYBOARD)..."
                    className="w-full bg-[#0a0b10] border border-[#2d2d3d] rounded-lg px-4 py-3 text-white placeholder-[#374151] focus:outline-none focus:border-amber-500/50 uppercase tracking-[0.2em] font-mono text-xs sm:text-sm"
                  />
                </div>

                <button
                  id="room3_submit_answer_btn"
                  type="submit"
                  className="w-full py-4 bg-white hover:bg-amber-500 text-[#0a0b10] font-black rounded-lg transition-all uppercase tracking-[0.3em] text-xs sm:text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  <span>Unlock Command</span>
                  <span className="text-xl">↵</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-[#6b7280] font-mono">
                  <span>Failed Attempts: <strong className="text-white">{attempts}</strong></span>
                  {!hintUsed && (
                    <button
                      type="button"
                      onClick={() => {
                        playKeyClickSound();
                        setHintUsed(true);
                      }}
                      className="text-amber-500 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Request AI Clue (-30 pts)
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-400 font-bold font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> {errorMessage}
                  </p>
                )}
              </form>
            ) : (
              /* Solved Card */
              <div className="p-5 rounded-lg bg-[#1a1c25] border border-green-500/50 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wider font-mono">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>AI Firewall Disengaged! Neural Vector Validated.</span>
                </div>
                <p className="text-xs text-[#9ca3af] font-mono">
                  <strong className="text-amber-400">Analysis:</strong> {activeRiddle.explanation}
                </p>
                <div className="pt-2">
                  <button
                    id="room3_proceed_btn"
                    onClick={handleProceedToRoom4}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                  >
                    <span>Unlock Room 4 (Rebus Gallery)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
