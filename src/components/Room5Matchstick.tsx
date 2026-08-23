import React, { useState } from "react";
import { Flame, Search, Check, HelpCircle, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";
import { playSuccessChime, playDoorUnlockSound, playErrorBuzzer, playClueFoundSound, playKeyClickSound } from "../utils/audio";
import { ClueItem } from "../types";

interface Room5Props {
  onFinalEscape: () => void;
  onDiscoverClue: (clue: ClueItem) => void;
  discoveredClues: ClueItem[];
}

const MATCHSTICK_SOLUTIONS = [
  "0 + 4 = 4",
  "5 + 4 = 9",
  "8 - 4 = 4",
  "0+4=4",
  "5+4=9",
  "8-4=4",
];

export const Room5Matchstick: React.FC<Room5Props> = ({
  onFinalEscape,
  onDiscoverClue,
  discoveredClues,
}) => {
  const [matchInput, setMatchInput] = useState("");
  const [matchSolved, setMatchSolved] = useState(false);
  const [matchHintActive, setMatchHintActive] = useState(false);

  const [seqInput, setSeqInput] = useState("");
  const [seqSolved, setSeqSolved] = useState(false);
  const [seqHintActive, setSeqHintActive] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [escapeError, setEscapeError] = useState(false);

  const handleMatchCheck = (val: string) => {
    setMatchInput(val);
    const clean = val.trim().replace(/\s+/g, " ");
    if (MATCHSTICK_SOLUTIONS.some((s) => s === clean || s.replace(/\s/g, "") === clean.replace(/\s/g, ""))) {
      if (!matchSolved) {
        playSuccessChime();
        setMatchSolved(true);
      }
    }
  };

  const handleSeqCheck = (val: string) => {
    setSeqInput(val);
    if (val.trim() === "21") {
      if (!seqSolved) {
        playSuccessChime();
        setSeqSolved(true);
      }
    }
  };

  const handleInspect = (clueId: string, name: string, icon: string, text: string) => {
    playClueFoundSound();
    onDiscoverClue({
      id: clueId,
      roomNumber: 5,
      name,
      icon,
      text,
      discovered: true,
    });
  };

  const handleTriggerEscape = () => {
    playKeyClickSound();
    if (matchSolved && seqSolved) {
      playDoorUnlockSound();
      onFinalEscape();
    } else {
      playErrorBuzzer();
      setEscapeError(true);
      setTimeout(() => setEscapeError(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Room Header Story */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
          Room 5: <span className="font-bold text-amber-500 italic">Matchstick &amp; Logic Blast Vault</span>
        </h2>
        <p className="text-[#9ca3af] text-xs sm:text-sm leading-relaxed max-w-2xl">
          You stand before the final reinforced blast vault separating you from the outside world. Dual barriers project a broken matchstick equation and a Fibonacci matrix. Balance both to trigger the master facility egress.
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
            id="room5_search_toggle_btn"
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#222533] text-[#e0e0e0] text-xs font-semibold uppercase tracking-wider transition border border-[#2d2d3d]"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>{showSearch ? "Hide Chamber Search" : "Inspect Vault Sconces"}</span>
          </button>
        </div>

        {showSearch && (
          <div className="mt-4 pt-4 border-t border-[#2d2d3d] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2">
            <div
              id="room5_clue_torch_btn"
              onClick={() =>
                handleInspect(
                  "r5_torch",
                  "Ancient Torch Sconce",
                  "🔦",
                  "Carving: 'Study the formation of the digit 6. Removing or shifting a single segment can transform it into a different digit that satisfies the addition or subtraction.'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">🔦</div>
              <div>
                <p className="text-xs font-bold text-white">Ancient Torch Sconce</p>
                <p className="text-[10px] text-[#6b7280]">Inspect carved stone markings.</p>
              </div>
            </div>

            <div
              id="room5_clue_floor_btn"
              onClick={() =>
                handleInspect(
                  "r5_floor",
                  "Geometric Floor Tiles",
                  "📐",
                  "Floor pattern: 'The ancient spiral sequence follows the Golden Ratio law: every tier is generated by calculating the sum of the two preceding numbers.'"
                )
              }
              className="bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#1a1c25] transition"
            >
              <div className="text-2xl">📐</div>
              <div>
                <p className="text-xs font-bold text-white">Geometric Floor Tiles</p>
                <p className="text-[10px] text-[#6b7280]">Examine etched mosaic spirals.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Challenge A: Matchstick Equation */}
        <div
          className={`p-5 sm:p-6 rounded-xl border transition flex flex-col justify-between gap-4 ${
            matchSolved
              ? "bg-[#1a1c25] border-green-500/40 text-green-300"
              : "bg-[#11131a] border-[#2d2d3d] text-[#e0e0e0]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#6b7280] mb-2 font-mono">
              <span className="font-bold text-amber-400 bg-[#11131a] px-2 py-0.5 rounded border border-[#2d2d3d] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Challenge A: Matchstick Formula
              </span>
              {matchSolved ? (
                <span className="flex items-center gap-1 text-green-400 font-bold">
                  <Check className="w-3.5 h-3.5" /> Balanced
                </span>
              ) : (
                <button
                  onClick={() => setMatchHintActive(!matchHintActive)}
                  className="text-amber-500 hover:underline flex items-center gap-1 font-bold"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Hint
                </button>
              )}
            </div>

            {/* Visual Matchstick Art */}
            <div className="bg-[#0a0b10] border border-[#2d2d3d] rounded p-4 text-center font-mono font-black text-2xl tracking-[0.25em] text-amber-400 my-2 shadow-inner">
              <div className="text-[10px] text-[#6b7280] font-normal mb-1 uppercase tracking-widest font-mono">Current Equation Display</div>
              6 + 4 = 4
            </div>

            <p className="text-[11px] text-[#9ca3af] mt-2 font-mono">
              <strong>Directive:</strong> Move exactly <strong>ONE matchstick</strong> to balance the equation and make it valid.
            </p>

            {matchHintActive && !matchSolved && (
              <p className="text-[10px] text-amber-300/90 italic mt-2 bg-[#1a1c25] p-2 rounded border border-amber-500/30 font-mono">
                💡 Hint: Focus on altering the first digit &apos;6&apos;. Try removing or relocating a single matchstick to form another valid digit (like &apos;0&apos; or &apos;8&apos;).
              </p>
            )}
          </div>

          <div>
            <input
              id="room5_matchstick_input"
              type="text"
              value={matchInput}
              onChange={(e) => handleMatchCheck(e.target.value)}
              disabled={matchSolved}
              placeholder="Enter balanced equation (e.g. X + Y = Z)..."
              className={`w-full px-4 py-2.5 rounded text-xs font-mono font-bold tracking-[0.15em] uppercase focus:outline-none border ${
                matchSolved
                  ? "bg-[#11131a] border-green-500/50 text-green-400 cursor-not-allowed"
                  : "bg-[#0a0b10] border-[#2d2d3d] text-white focus:border-amber-500/50"
              }`}
            />

            {matchSolved && (
              <div className="text-[10px] text-green-400 font-bold mt-2 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4" /> Laser Barrier Alpha Deactivated!
              </div>
            )}
          </div>
        </div>

        {/* Challenge B: Sequence Matrix */}
        <div
          className={`p-5 sm:p-6 rounded-xl border transition flex flex-col justify-between gap-4 ${
            seqSolved
              ? "bg-[#1a1c25] border-green-500/40 text-green-300"
              : "bg-[#11131a] border-[#2d2d3d] text-[#e0e0e0]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#6b7280] mb-2 font-mono">
              <span className="font-bold text-amber-400 bg-[#11131a] px-2 py-0.5 rounded border border-[#2d2d3d] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Challenge B: Fibonacci Matrix
              </span>
              {seqSolved ? (
                <span className="flex items-center gap-1 text-green-400 font-bold">
                  <Check className="w-3.5 h-3.5" /> Solved
                </span>
              ) : (
                <button
                  onClick={() => setSeqHintActive(!seqHintActive)}
                  className="text-amber-500 hover:underline flex items-center gap-1 font-bold"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Hint
                </button>
              )}
            </div>

            {/* Sequence Box */}
            <div className="bg-[#0a0b10] border border-[#2d2d3d] rounded p-4 text-center font-mono font-black text-2xl tracking-[0.25em] text-amber-400 my-2 shadow-inner">
              <div className="text-[10px] text-[#6b7280] font-normal mb-1 uppercase tracking-widest font-mono">Sequence Sequence Pulse</div>
              2, 3, 5, 8, 13, [ ? ]
            </div>

            <p className="text-[11px] text-[#9ca3af] mt-2 font-mono">
              <strong>Directive:</strong> Each subsequent security pulse is the mathematical sum of the preceding two numbers.
            </p>

            {seqHintActive && !seqSolved && (
              <p className="text-[10px] text-amber-300/90 italic mt-2 bg-[#1a1c25] p-2 rounded border border-amber-500/30 font-mono">
                💡 Hint: Determine the sum of the last two numbers in the sequence (8 and 13).
              </p>
            )}
          </div>

          <div>
            <input
              id="room5_sequence_input"
              type="text"
              value={seqInput}
              onChange={(e) => handleSeqCheck(e.target.value)}
              disabled={seqSolved}
              placeholder="Enter missing sequence number..."
              className={`w-full px-4 py-2.5 rounded text-xs font-mono font-bold tracking-[0.2em] uppercase focus:outline-none border ${
                seqSolved
                  ? "bg-[#11131a] border-green-500/50 text-green-400 cursor-not-allowed"
                  : "bg-[#0a0b10] border-[#2d2d3d] text-white focus:border-amber-500/50"
              }`}
            />

            {seqSolved && (
              <div className="text-[10px] text-green-400 font-bold mt-2 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4" /> Laser Barrier Beta Deactivated!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Blast Doors Escape Lever */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-6 sm:p-8 shadow-2xl text-center space-y-4 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-[#0a0b10] text-[10px] font-bold rounded uppercase tracking-tighter">
          Master Facility Escape Protocol
        </div>

        <div className="inline-flex p-3 rounded-full bg-[#1a1c25] border border-amber-500/30 text-amber-500 pt-3">
          <Award className="w-6 h-6" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase font-mono">
          Final Vault Override Egress
        </h3>

        <p className="text-xs text-[#9ca3af] max-w-lg mx-auto font-mono">
          Once both Laser Barriers (Alpha &amp; Beta) are disengaged, trigger the master hydraulic override to unseal the facility blast doors and escape!
        </p>

        <div className="pt-2">
          <button
            id="room5_escape_override_btn"
            onClick={handleTriggerEscape}
            className="w-full sm:w-auto px-10 py-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.25em] transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3 mx-auto"
          >
            <span>Trigger Final Escape &amp; Claim Victory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {escapeError && (
          <p className="text-xs text-rose-400 font-bold font-mono animate-shake">
            ❌ Both Laser Barriers (Alpha: Matchstick Formula &amp; Beta: Fibonacci Matrix) must be deactivated first!
          </p>
        )}
      </div>
    </div>
  );
};
