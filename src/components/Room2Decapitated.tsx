import React, { useState } from "react";
import { KeyRound, Search, Check, HelpCircle, ArrowRight, ShieldCheck, Database } from "lucide-react";
import { playSuccessChime, playDoorUnlockSound, playErrorBuzzer, playClueFoundSound, playKeyClickSound } from "../utils/audio";
import { ClueItem } from "../types";

interface Room2Props {
  onUnlockRoom: (nextRoom: number, earnedPoints: number) => void;
  onDiscoverClue: (clue: ClueItem) => void;
  discoveredClues: ClueItem[];
}

const DECAPITATED_DATA = [
  { id: 1, pattern: "_ A T _", category: "Animals", clue: "A domestic pet that meows, purrs, and catches mice.", answer: "CAT", hint: "Three letters. Rhymes with bat and hat." },
  { id: 2, pattern: "_ Y T H O _", category: "Programming", clue: "High-level object-oriented programming language named after a comedy show.", answer: "PYTHON", hint: "Snake mascot, creator Guido van Rossum." },
  { id: 3, pattern: "_ O B O _", category: "Technology", clue: "An automated electro-mechanical machine programmed to do tasks.", answer: "ROBOT", hint: "Starts with R, ends with T. Think sci-fi android." },
  { id: 4, pattern: "_ A P T O _", category: "College Objects", clue: "A foldable portable personal computer carried to lectures.", answer: "LAPTOP", hint: "You keep it on your lap when working." },
  { id: 5, pattern: "_ O M P I L E _", category: "Computer Science", clue: "Software tool that translates source code into machine machine-executable binary.", answer: "COMPILER", hint: "GCC and Clang are examples of this tool." },
];

const SECRET_KEY = "ESCAPE2026";

export const Room2Decapitated: React.FC<Room2Props> = ({
  onUnlockRoom,
  onDiscoverClue,
  discoveredClues,
}) => {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [solvedWords, setSolvedWords] = useState<{ [key: number]: boolean }>({});
  const [activeHints, setActiveHints] = useState<{ [key: number]: boolean }>({});
  const [keyInput, setKeyInput] = useState("");
  const [doorError, setDoorError] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleWordInput = (id: number, val: string) => {
    const nextAnswers = { ...userAnswers, [id]: val.toUpperCase() };
    setUserAnswers(nextAnswers);

    const target = DECAPITATED_DATA.find((w) => w.id === id);
    const clean = val.trim().toUpperCase();
    if (target && (clean === target.answer || (target.id === 1 && (clean === "CAT" || clean === "CATS")))) {
      if (!solvedWords[id]) {
        playSuccessChime();
        setSolvedWords((prev) => ({ ...prev, [id]: true }));
      }
    }
  };

  const handleInspect = (clueId: string, name: string, icon: string, text: string) => {
    playClueFoundSound();
    onDiscoverClue({
      id: clueId,
      roomNumber: 2,
      name,
      icon,
      text,
      discovered: true,
    });
  };

  const handleUnlockDoor = () => {
    playKeyClickSound();
    if (keyInput.trim().toUpperCase() === SECRET_KEY) {
      playDoorUnlockSound();
      onUnlockRoom(3, 300);
    } else {
      playErrorBuzzer();
      setDoorError(true);
      setTimeout(() => setDoorError(false), 2000);
    }
  };

  const allSolved = DECAPITATED_DATA.every((w) => solvedWords[w.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Room Header */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
          Room 2: <span className="font-bold text-amber-500 italic">Decapitated Cipher Archive</span>
        </h2>
        <p className="text-[#9ca3af] text-xs sm:text-sm leading-relaxed max-w-2xl">
          You step into the sub-basement archive vault. Damaged file sectors display decapitated word patterns missing their outer boundary letters. Identify the missing words across categories to generate and authorize the master chamber decryption key.
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
            id="room2_search_toggle_btn"
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#222533] text-[#e0e0e0] text-xs font-semibold uppercase tracking-wider transition border border-[#2d2d3d]"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>{showSearch ? "Hide Chamber Search" : "Inspect Archive Objects"}</span>
          </button>
        </div>

        {showSearch && (
          <div className="mt-4 pt-4 border-t border-[#2d2d3d] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2">
            <div
              id="room2_clue_drawer_btn"
              onClick={() =>
                handleInspect(
                  "r2_drawer",
                  "Metal Filing Drawer",
                  "🗄",
                  "Found taped label: 'Master key format combines the word ESCAPE with the current operational cycle year 2026.'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">🗄</div>
              <div>
                <p className="text-xs font-bold text-white">Metal Filing Drawer</p>
                <p className="text-[10px] text-[#6b7280]">Open rusted steel cabinet drawer.</p>
              </div>
            </div>

            <div
              id="room2_clue_mirror_btn"
              onClick={() =>
                handleInspect(
                  "r2_mirror",
                  "Dusty Wall Mirror",
                  "🪞",
                  "Etched on glass: 'Solve all 5 decapitated ciphers to unseal the security buffer and reveal the decryption key!'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">🪞</div>
              <div>
                <p className="text-xs font-bold text-white">Dusty Wall Mirror</p>
                <p className="text-[10px] text-[#6b7280]">Wipe the silvered mirror surface.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pattern Cards */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-mono text-amber-500">
            <Database className="w-4 h-4 text-amber-500" />
            Decapitated Word Records
          </h3>
          <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">
            {Object.values(solvedWords).filter(Boolean).length} / 5 Ciphers Restored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DECAPITATED_DATA.map((w, index) => {
            const isSolved = !!solvedWords[w.id];
            const showHint = !!activeHints[w.id];

            return (
              <div
                key={w.id}
                className={`p-4 rounded-lg border transition flex flex-col justify-between gap-3 ${
                  isSolved
                    ? "bg-[#1a1c25] border-green-500/40 text-green-300"
                    : "bg-[#0a0b10] border-[#2d2d3d] text-[#e0e0e0]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#6b7280] mb-1 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-[#11131a] text-amber-400 border border-[#2d2d3d]">
                      {w.category}
                    </span>
                    {isSolved ? (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> Restored
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveHints((prev) => ({ ...prev, [w.id]: !prev[w.id] }))}
                        className="text-amber-500 hover:underline flex items-center gap-1 font-bold"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Clue
                      </button>
                    )}
                  </div>

                  <div className="font-mono text-xl font-black tracking-[0.25em] text-amber-400 my-2 bg-[#11131a] py-2 px-3 rounded border border-[#2d2d3d] text-center">
                    {w.pattern}
                  </div>

                  <p className="text-[10px] text-[#9ca3af] mt-1 leading-snug">{w.clue}</p>

                  {showHint && !isSolved && (
                    <p className="text-[10px] text-amber-300/90 italic mt-2 bg-[#1a1c25] p-2 rounded border border-amber-500/30">
                      💡 {w.hint}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={userAnswers[w.id] || ""}
                    onChange={(e) => handleWordInput(w.id, e.target.value)}
                    disabled={isSolved}
                    placeholder="Enter complete word..."
                    className={`w-full px-3 py-2.5 rounded text-xs font-mono font-bold tracking-[0.2em] uppercase focus:outline-none border ${
                      isSolved
                        ? "bg-[#11131a] border-green-500/50 text-green-400 cursor-not-allowed"
                        : "bg-[#11131a] border-[#2d2d3d] text-white focus:border-amber-500/50"
                    }`}
                  />
                  {isSolved && (
                    <div className="text-[10px] text-green-400 font-bold mt-2 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Full Word:{" "}
                      <span className="font-mono font-black text-amber-400 bg-[#0a0b10] px-1.5 py-0.5 rounded border border-[#2d2d3d]">
                        {w.answer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secret Master Key Console */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-6 sm:p-8 shadow-2xl relative space-y-4">
        <div className="absolute -top-3 left-8 px-3 py-1 bg-amber-500 text-[#0a0b10] text-[10px] font-bold rounded uppercase tracking-tighter">
          Master Archive Key Console
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Vault Decryption Egress</span>
          </div>

          {allSolved && (
            <div className="px-3 py-1 rounded bg-[#1a1c25] border border-green-500/50 text-green-400 text-[10px] font-mono font-bold">
              ✓ ALL 5 CIPHERS SOLVED ➔ KEY: {SECRET_KEY}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            id="room2_key_input"
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
            placeholder="ENTER VAULT DECRYPTION KEY"
            className="flex-1 bg-[#0a0b10] border border-[#2d2d3d] rounded-lg px-4 py-3 text-sm font-mono font-bold tracking-[0.25em] text-center text-white placeholder-[#374151] focus:outline-none focus:border-amber-500/50 uppercase"
          />

          <button
            id="room2_door_unlock_btn"
            onClick={handleUnlockDoor}
            className="px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
          >
            <span>Unlock Room 3 (AI Core)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {doorError && (
          <p className="text-xs text-rose-400 font-bold font-mono text-center">
            ❌ Invalid Key! Restore all 5 ciphers to obtain the vault decryption passphrase.
          </p>
        )}
      </div>
    </div>
  );
};
