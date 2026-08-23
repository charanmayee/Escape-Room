import React, { useState } from "react";
import { KeyRound, Search, Check, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { playSuccessChime, playDoorUnlockSound, playErrorBuzzer, playClueFoundSound, playKeyClickSound } from "../utils/audio";
import { ClueItem } from "../types";

interface Room1Props {
  onUnlockRoom: (nextRoom: number, earnedPoints: number) => void;
  onDiscoverClue: (clue: ClueItem) => void;
  discoveredClues: ClueItem[];
}

const WORDS_DATA = [
  { id: 1, scrambled: "N P Y T H O", answer: "PYTHON", hint: "The leading language for AI and college coding projects." },
  { id: 2, scrambled: "G L O C L E E", answer: "COLLEGE", hint: "The academic campus institute where students attend lectures." },
  { id: 3, scrambled: "T N U D E T S", answer: "STUDENT", hint: "A learner enrolled in college coursework." },
  { id: 4, scrambled: "T C O J E R P", answer: "PROJECT", hint: "A collaborative software assignment built before finals." },
  { id: 5, scrambled: "G I D C O N", answer: "CODING", hint: "The act of writing and debugging program syntax." },
];

const MASTER_CODE = "PCSPC";

export const Room1WordScramble: React.FC<Room1Props> = ({
  onUnlockRoom,
  onDiscoverClue,
  discoveredClues,
}) => {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [solvedWords, setSolvedWords] = useState<{ [key: number]: boolean }>({});
  const [activeHints, setActiveHints] = useState<{ [key: number]: boolean }>({});
  const [doorCodeInput, setDoorCodeInput] = useState("");
  const [doorError, setDoorError] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleWordInput = (id: number, val: string) => {
    const nextAnswers = { ...userAnswers, [id]: val.toUpperCase() };
    setUserAnswers(nextAnswers);

    const target = WORDS_DATA.find((w) => w.id === id);
    if (target && val.trim().toUpperCase() === target.answer) {
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
      roomNumber: 1,
      name,
      icon,
      text,
      discovered: true,
    });
  };

  const handleUnlockDoor = () => {
    playKeyClickSound();
    if (doorCodeInput.trim().toUpperCase() === MASTER_CODE) {
      playDoorUnlockSound();
      // 100 base + 200 room completion
      onUnlockRoom(2, 300);
    } else {
      playErrorBuzzer();
      setDoorError(true);
      setTimeout(() => setDoorError(false), 2000);
    }
  };

  // Extracted first letters
  const extractedLetters = WORDS_DATA.map((w) => (solvedWords[w.id] ? w.answer[0] : "_"));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Room Header Story */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
          Room 1: <span className="font-bold text-amber-500 italic">Campus Dormitory Lockdown</span>
        </h2>
        <p className="text-[#9ca3af] text-xs sm:text-sm leading-relaxed max-w-2xl">
          You woke up trapped inside the campus lab after hours. The electronic egress lock requires a 5-letter master override passcode. Unscramble all 5 words on the whiteboard, then <strong>extract the FIRST letter of each solved word</strong> to crack the door.
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
            id="room1_search_toggle_btn"
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#222533] text-[#e0e0e0] text-xs font-semibold uppercase tracking-wider transition border border-[#2d2d3d]"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>{showSearch ? "Hide Chamber Search" : "Inspect Room Objects"}</span>
          </button>
        </div>

        {showSearch && (
          <div className="mt-4 pt-4 border-t border-[#2d2d3d] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in slide-in-from-top-2">
            <div
              id="room1_clue_notebook_btn"
              onClick={() =>
                handleInspect(
                  "r1_notebook",
                  "Physics Notebook",
                  "📘",
                  "Notes on desk: 'The password is made from the FIRST letter of each unscrambled word!'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">📘</div>
              <div>
                <p className="text-xs font-bold text-white">Physics Notebook</p>
                <p className="text-[10px] text-[#6b7280]">Inspect student notes on desk.</p>
              </div>
            </div>

            <div
              id="room1_clue_mug_btn"
              onClick={() =>
                handleInspect(
                  "r1_mug",
                  "Dean's Coffee Mug",
                  "☕",
                  "Under the mug is written: '5 words in total. Combine the initial letter of each word to form the master key.'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">☕</div>
              <div>
                <p className="text-xs font-bold text-white">Dean&apos;s Coffee Mug</p>
                <p className="text-[10px] text-[#6b7280]">Check underside of ceramic mug.</p>
              </div>
            </div>

            <div
              id="room1_clue_terminal_btn"
              onClick={() =>
                handleInspect(
                  "r1_terminal",
                  "Lab Terminal Screen",
                  "💻",
                  "Screen reads: 'Passcode is exactly 5 letters. Case-insensitive.'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">💻</div>
              <div>
                <p className="text-xs font-bold text-white">Lab CRT Terminal</p>
                <p className="text-[10px] text-[#6b7280]">Tap flickering CRT display.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word Scramble Grid */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-mono text-amber-500">
            <span>🧩</span> Lab Whiteboard Anagrams
          </h3>
          <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">
            {Object.values(solvedWords).filter(Boolean).length} / 5 Words Solved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORDS_DATA.map((w, index) => {
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
                    <span>Word #{index + 1}</span>
                    {isSolved ? (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> Solved
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveHints((prev) => ({ ...prev, [w.id]: !prev[w.id] }))}
                        className="text-amber-500 hover:underline flex items-center gap-1 font-bold"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Hint
                      </button>
                    )}
                  </div>

                  <div className="font-mono text-xl font-black tracking-[0.25em] text-amber-400 my-2 bg-[#11131a] py-2 px-3 rounded border border-[#2d2d3d] text-center">
                    {w.scrambled}
                  </div>

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
                    placeholder="Type answer..."
                    className={`w-full px-3 py-2.5 rounded text-xs font-mono font-bold tracking-[0.2em] uppercase focus:outline-none border ${
                      isSolved
                        ? "bg-[#11131a] border-green-500/50 text-green-400 cursor-not-allowed"
                        : "bg-[#11131a] border-[#2d2d3d] text-white focus:border-amber-500/50"
                    }`}
                  />
                  {isSolved && (
                    <div className="text-[10px] text-green-400 font-bold mt-2 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> First Letter:{" "}
                      <span className="font-mono font-black text-amber-400 bg-[#0a0b10] px-1.5 py-0.5 rounded border border-[#2d2d3d]">
                        {w.answer[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Door Keypad Master Unlock Terminal */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-6 sm:p-8 shadow-2xl relative space-y-4">
        <div className="absolute -top-3 left-8 px-3 py-1 bg-amber-500 text-[#0a0b10] text-[10px] font-bold rounded uppercase tracking-tighter">
          Chamber 01 Exit Keypad
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Master Buffer Status:</span>
          </div>

          {/* Badge display of extracted letters */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#6b7280] font-mono">Extracted Key:</span>
            <div className="flex gap-1.5 font-mono font-black text-sm">
              {extractedLetters.map((l, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 flex items-center justify-center rounded border ${
                    l !== "_"
                      ? "bg-[#1a1c25] border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                      : "bg-[#0a0b10] border-[#2d2d3d] text-[#4b5563]"
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            id="room1_door_input"
            type="text"
            value={doorCodeInput}
            onChange={(e) => setDoorCodeInput(e.target.value.toUpperCase())}
            maxLength={5}
            placeholder="ENTER 5-LETTER OVERRIDE KEY ( _ _ _ _ _ )"
            className="flex-1 bg-[#0a0b10] border border-[#2d2d3d] rounded-lg px-4 py-3 text-sm font-mono font-bold tracking-[0.25em] text-center text-white placeholder-[#374151] focus:outline-none focus:border-amber-500/50 uppercase"
          />

          <button
            id="room1_door_unlock_btn"
            onClick={handleUnlockDoor}
            className="px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
          >
            <span>Unlock Room 2 Door</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {doorError && (
          <p className="text-xs text-rose-400 font-bold font-mono text-center">
            ❌ Access Denied! Passcode incorrect. Unscramble all words to extract first letters.
          </p>
        )}
      </div>
    </div>
  );
};
