import React, { useState } from "react";
import { Eye, Search, Check, HelpCircle, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { playSuccessChime, playDoorUnlockSound, playErrorBuzzer, playClueFoundSound, playKeyClickSound } from "../utils/audio";
import { ClueItem } from "../types";

interface Room4Props {
  onUnlockRoom: (nextRoom: number, earnedPoints: number) => void;
  onDiscoverClue: (clue: ClueItem) => void;
  discoveredClues: ClueItem[];
}

const REBUS_DATA = [
  {
    id: 1,
    title: "Rebus Card Alpha",
    visual: ["🚲 cycle", "🚲 cycle", "🚲 cycle"],
    description: "Three repeating cycles vertically aligned.",
    answer: "TRICYCLE",
    digit: "4",
    hint: "Prefix for three is Tri-. A vehicle with 3 wheels.",
  },
  {
    id: 2,
    title: "Rebus Card Beta",
    visual: ["  MAN  ", "———————", " BOARD "],
    description: "The word MAN positioned directly above the word BOARD.",
    answer: "MAN OVERBOARD",
    digit: "8",
    hint: "Spatial placement: MAN is OVER BOARD. A mariner warning cry.",
  },
  {
    id: 3,
    title: "Rebus Card Gamma",
    visual: ["STAND", "  I  "],
    description: "The letter I situated beneath the word STAND.",
    answer: "I UNDERSTAND",
    digit: "2",
    hint: "The letter 'I' is located UNDER the word 'STAND'.",
  },
  {
    id: 4,
    title: "Rebus Card Delta",
    visual: ["M C E", "M C E", "M C E"],
    description: "Three mice written without the letter 'i' (no eyes).",
    answer: "THREE BLIND MICE",
    digit: "7",
    hint: "Three mice that have no 'eyes' (letter i). Popular nursery song.",
  },
];

const MASTER_SAFE_CODE = "4827";

export const Room4Rebus: React.FC<Room4Props> = ({
  onUnlockRoom,
  onDiscoverClue,
  discoveredClues,
}) => {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [solvedCards, setSolvedCards] = useState<{ [key: number]: boolean }>({});
  const [activeHints, setActiveHints] = useState<{ [key: number]: boolean }>({});
  const [cardErrors, setCardErrors] = useState<{ [key: number]: boolean }>({});
  const [safeCodeInput, setSafeCodeInput] = useState("");
  const [doorError, setDoorError] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const normalizeAnswer = (str: string): string => {
    return str
      .trim()
      .toUpperCase()
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ");
  };

  const verifyCardAnswer = (id: number, val: string) => {
    const target = REBUS_DATA.find((r) => r.id === id);
    if (!target) return false;

    const normalizedInput = normalizeAnswer(val);
    const normalizedExpected = normalizeAnswer(target.answer);

    // Strictly require complete, full case-insensitive string match
    return normalizedInput.length > 0 && normalizedInput === normalizedExpected;
  };

  const handleCardInput = (id: number, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [id]: val.toUpperCase() }));

    // Auto-confirm if user has typed the full, exact case-insensitive answer
    if (verifyCardAnswer(id, val)) {
      if (!solvedCards[id]) {
        playSuccessChime();
        setSolvedCards((prev) => ({ ...prev, [id]: true }));
        setCardErrors((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleCardSubmit = (id: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (solvedCards[id]) return;

    const currentVal = userAnswers[id] || "";
    if (verifyCardAnswer(id, currentVal)) {
      playSuccessChime();
      setSolvedCards((prev) => ({ ...prev, [id]: true }));
      setCardErrors((prev) => ({ ...prev, [id]: false }));
    } else {
      playErrorBuzzer();
      setCardErrors((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCardErrors((prev) => ({ ...prev, [id]: false }));
      }, 1500);
    }
  };

  const handleInspect = (clueId: string, name: string, icon: string, text: string) => {
    playClueFoundSound();
    onDiscoverClue({
      id: clueId,
      roomNumber: 4,
      name,
      icon,
      text,
      discovered: true,
    });
  };

  const handleUnlockSafe = () => {
    playKeyClickSound();
    if (safeCodeInput.trim() === MASTER_SAFE_CODE) {
      playDoorUnlockSound();
      onUnlockRoom(5, 300);
    } else {
      playErrorBuzzer();
      setDoorError(true);
      setTimeout(() => setDoorError(false), 2000);
    }
  };

  const unlockedDigits = REBUS_DATA.map((r) => (solvedCards[r.id] ? r.digit : "_"));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Room Header Story */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
          Room 4: <span className="font-bold text-amber-500 italic">Visual Rebus Gallery</span>
        </h2>
        <p className="text-[#9ca3af] text-xs sm:text-sm leading-relaxed max-w-2xl">
          The corridor leads into a mysterious gallery of optical rebus word art. Each solved visual cryptogram reveals a classified digit. Decode all 4 visual puzzles to discover the 4-digit safe combination to unlock the exit.
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
            id="room4_search_toggle_btn"
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#222533] text-[#e0e0e0] text-xs font-semibold uppercase tracking-wider transition border border-[#2d2d3d]"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>{showSearch ? "Hide Chamber Search" : "Inspect Gallery Artifacts"}</span>
          </button>
        </div>

        {showSearch && (
          <div className="mt-4 pt-4 border-t border-[#2d2d3d] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2">
            <div
              id="room4_clue_painting_btn"
              onClick={() =>
                handleInspect(
                  "r4_painting",
                  "Framed Oil Painting",
                  "🖼",
                  "Behind the frame is scribbled: 'Each solved Rebus card releases one security digit in order (Card Alpha through Delta) for the egress safe!'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">🖼</div>
              <div>
                <p className="text-xs font-bold text-white">Framed Oil Painting</p>
                <p className="text-[10px] text-[#6b7280]">Peek behind the antique portrait.</p>
              </div>
            </div>

            <div
              id="room4_clue_clock_btn"
              onClick={() =>
                handleInspect(
                  "r4_clock",
                  "Pendulum Wall Clock",
                  "🕰",
                  "Inside clock case: 'Rebus puzzles use spatial word relationships, sounds, and wordplay like OVER, UNDER, and missing letters.'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">🕰</div>
              <div>
                <p className="text-xs font-bold text-white">Pendulum Wall Clock</p>
                <p className="text-[10px] text-[#6b7280]">Open carved wooden clock door.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rebus Gallery Cards */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-mono text-amber-500">
            <Eye className="w-4 h-4 text-amber-500" />
            Visual Cryptograms
          </h3>
          <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">
            {Object.values(solvedCards).filter(Boolean).length} / 4 Rebus Solved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REBUS_DATA.map((r) => {
            const isSolved = !!solvedCards[r.id];
            const showHint = !!activeHints[r.id];

            return (
              <div
                key={r.id}
                className={`p-5 rounded-lg border transition flex flex-col justify-between gap-4 ${
                  isSolved
                    ? "bg-[#1a1c25] border-green-500/40 text-green-300"
                    : "bg-[#0a0b10] border-[#2d2d3d] text-[#e0e0e0]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#6b7280] mb-2 font-mono">
                    <span className="font-bold text-amber-400 bg-[#11131a] px-2 py-0.5 rounded border border-[#2d2d3d]">
                      {r.title}
                    </span>
                    {isSolved ? (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> Decoded
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveHints((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                        className="text-amber-500 hover:underline flex items-center gap-1 font-bold"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Hint
                      </button>
                    )}
                  </div>

                  {/* Visual Rebus Art Box */}
                  <div className="bg-[#11131a] border border-[#2d2d3d] rounded p-4 text-center font-mono font-black text-base sm:text-lg tracking-wider text-amber-300 my-2">
                    {r.visual.map((line, lIdx) => (
                      <div key={lIdx} className="leading-relaxed">
                        {line}
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-[#9ca3af] italic text-center mt-2 font-mono">{r.description}</p>

                  {showHint && !isSolved && (
                    <p className="text-[10px] text-amber-300/90 italic mt-2 bg-[#1a1c25] p-2 rounded border border-amber-500/30 font-mono">
                      💡 {r.hint}
                    </p>
                  )}
                </div>

                <div>
                  <form onSubmit={(e) => handleCardSubmit(r.id, e)} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        id={`rebus_input_${r.id}`}
                        type="text"
                        value={userAnswers[r.id] || ""}
                        onChange={(e) => handleCardInput(r.id, e.target.value)}
                        disabled={isSolved}
                        placeholder="Enter decoded phrase..."
                        className={`flex-1 px-3.5 py-2.5 rounded text-xs font-mono font-bold tracking-[0.15em] uppercase focus:outline-none border ${
                          isSolved
                            ? "bg-[#11131a] border-green-500/50 text-green-400 cursor-not-allowed"
                            : cardErrors[r.id]
                            ? "bg-[#1f1215] border-rose-500 text-rose-300 focus:border-rose-500"
                            : "bg-[#11131a] border-[#2d2d3d] text-white focus:border-amber-500/50"
                        }`}
                      />
                      {!isSolved && (
                        <button
                          id={`rebus_submit_btn_${r.id}`}
                          type="submit"
                          className="px-3.5 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-[#0a0b10] text-xs font-mono font-black uppercase tracking-wider transition"
                        >
                          Check
                        </button>
                      )}
                    </div>
                  </form>

                  {cardErrors[r.id] && !isSolved && (
                    <p className="text-[10px] text-rose-400 font-mono font-bold mt-1.5 animate-in fade-in">
                      ❌ Incorrect decoded phrase. Re-examine visual wordplay.
                    </p>
                  )}

                  {isSolved && (
                    <div className="text-[10px] text-green-400 font-bold mt-2 flex items-center justify-between bg-[#11131a] p-2 rounded border border-[#2d2d3d] font-mono">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> {r.answer}
                      </span>
                      <span className="font-mono font-black text-amber-400 bg-[#0a0b10] px-2 py-0.5 rounded border border-[#2d2d3d]">
                        Digit: {r.digit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Digit Combination Safe */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-6 sm:p-8 shadow-2xl relative space-y-4">
        <div className="absolute -top-3 left-8 px-3 py-1 bg-amber-500 text-[#0a0b10] text-[10px] font-bold rounded uppercase tracking-tighter">
          Chamber 04 Safe Console
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>4-Digit Cryptographic Egress</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-[10px] uppercase tracking-widest text-[#6b7280]">Digits:</span>
            <div className="flex gap-1.5 font-mono font-black text-xs">
              {unlockedDigits.map((d, i) => (
                <span
                  key={i}
                  className={`w-7 h-7 flex items-center justify-center rounded border ${
                    d !== "_"
                      ? "bg-[#1a1c25] border-amber-500 text-amber-400"
                      : "bg-[#0a0b10] border-[#2d2d3d] text-[#4b5563]"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUnlockSafe();
          }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <input
            id="room4_safe_code_input"
            type="text"
            value={safeCodeInput}
            onChange={(e) => setSafeCodeInput(e.target.value)}
            maxLength={4}
            placeholder="ENTER 4-DIGIT SAFE CODE ( _ _ _ _ )"
            className="flex-1 bg-[#0a0b10] border border-[#2d2d3d] rounded-lg px-4 py-3 text-sm font-mono font-bold tracking-[0.3em] text-center text-white placeholder-[#374151] focus:outline-none focus:border-amber-500/50"
          />

          <button
            id="room4_safe_unlock_btn"
            type="submit"
            className="px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
          >
            <span>Crack Safe & Unlock Room 5</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {doorError && (
          <p className="text-xs text-rose-400 font-bold font-mono animate-shake text-center">
            ❌ Safe Alarm Tripped! Incorrect digits. Decode all four Rebus cards to obtain the digits.
          </p>
        )}
      </div>
    </div>
  );
};
