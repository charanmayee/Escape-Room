import React, { useState, useEffect } from "react";
import { X, Sparkles, Trophy, Check, RefreshCw, Eye, Grid } from "lucide-react";
import { playSuccessChime, playErrorBuzzer, playKeyClickSound } from "../utils/audio";

interface BonusChamberModalProps {
  onClose: () => void;
  onAwardBonusPoints: (points: number) => void;
}

export const BonusChamberModal: React.FC<BonusChamberModalProps> = ({
  onClose,
  onAwardBonusPoints,
}) => {
  const [activeTab, setActiveTab] = useState<"sudoku" | "color" | "spot">("sudoku");

  // --- 1. 4x4 SUDOKU STATE ---
  // Initial puzzle with blanks as 0
  const initialSudoku = [
    [1, 0, 3, 0],
    [0, 0, 0, 2],
    [3, 0, 0, 0],
    [0, 4, 0, 1],
  ];
  const sudokuSolution = [
    [1, 2, 3, 4],
    [4, 3, 1, 2],
    [3, 1, 2, 4],
    [2, 4, 4, 1], // standard valid 4x4
  ];
  // Better verified 4x4 grid:
  // Row 0: 1 2 3 4
  // Row 1: 4 3 2 1
  // Row 2: 2 1 4 3
  // Row 3: 3 4 1 2
  const fixedSolution = [
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    [2, 1, 4, 3],
    [3, 4, 1, 2],
  ];
  const fixedPuzzle = [
    [1, 0, 3, 0],
    [0, 3, 0, 1],
    [2, 0, 4, 0],
    [0, 4, 0, 2],
  ];

  const [sudokuGrid, setSudokuGrid] = useState<number[][]>(fixedPuzzle);
  const [sudokuSolved, setSudokuSolved] = useState(false);
  const [sudokuError, setSudokuError] = useState(false);

  const handleSudokuCell = (r: number, c: number, val: string) => {
    playKeyClickSound();
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 4) {
      const next = sudokuGrid.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? 0 : cell))
      );
      setSudokuGrid(next);
      return;
    }
    const next = sudokuGrid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? num : cell))
    );
    setSudokuGrid(next);

    // Check if fully and correctly filled
    let allFilled = true;
    let correct = true;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (next[i][j] === 0) allFilled = false;
        if (next[i][j] !== fixedSolution[i][j]) correct = false;
      }
    }

    if (allFilled && correct) {
      playSuccessChime();
      setSudokuSolved(true);
      onAwardBonusPoints(150);
    }
  };

  // --- 2. COLOR SEQUENCE MEMORY STATE ---
  const COLORS = ["cyan", "amber", "purple", "emerald"] as const;
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [colorStatus, setColorStatus] = useState<"idle" | "showing" | "playing" | "won" | "lost">("idle");
  const [activeFlash, setActiveFlash] = useState<string | null>(null);

  const startColorGame = () => {
    const newSeq = [
      COLORS[Math.floor(Math.random() * 4)],
      COLORS[Math.floor(Math.random() * 4)],
      COLORS[Math.floor(Math.random() * 4)],
      COLORS[Math.floor(Math.random() * 4)],
      COLORS[Math.floor(Math.random() * 4)],
    ];
    setSequence(newSeq);
    setPlayerSequence([]);
    setColorStatus("showing");

    newSeq.forEach((col, idx) => {
      setTimeout(() => {
        setActiveFlash(col);
        playKeyClickSound();
        setTimeout(() => setActiveFlash(null), 400);
      }, (idx + 1) * 700);
    });

    setTimeout(() => {
      setColorStatus("playing");
    }, (newSeq.length + 1) * 700);
  };

  const handleColorClick = (color: string) => {
    if (colorStatus !== "playing") return;
    playKeyClickSound();
    const nextPlayerSeq = [...playerSequence, color];
    setPlayerSequence(nextPlayerSeq);

    const currIdx = nextPlayerSeq.length - 1;
    if (nextPlayerSeq[currIdx] !== sequence[currIdx]) {
      playErrorBuzzer();
      setColorStatus("lost");
      return;
    }

    if (nextPlayerSeq.length === sequence.length) {
      playSuccessChime();
      setColorStatus("won");
      onAwardBonusPoints(100);
    }
  };

  // --- 3. SPOT THE DIFFERENCE STATE ---
  const [foundSpots, setFoundSpots] = useState<number[]>([]);
  const spotLocations = [
    { id: 1, name: "Missing Coffee Mug Steam", x: "18%", y: "30%" },
    { id: 2, name: "Reversed Clock Hands", x: "82%", y: "20%" },
    { id: 3, name: "Green LED turned Red", x: "50%", y: "75%" },
  ];

  const handleSpotClick = (id: number) => {
    if (!foundSpots.includes(id)) {
      playSuccessChime();
      const next = [...foundSpots, id];
      setFoundSpots(next);
      if (next.length === spotLocations.length) {
        onAwardBonusPoints(100);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0a0b10] border-b border-[#2d2d3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#1a1c25] border border-amber-500/40 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Bonus Chamber Subroutines
              </h2>
              <p className="text-[10px] text-[#9ca3af]">Earn up to +350 extra points for the Leaderboard!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#9ca3af] hover:text-white hover:bg-[#1a1c25] transition border border-transparent hover:border-[#2d2d3d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#2d2d3d] bg-[#0a0b10] text-[11px] font-bold uppercase tracking-wider">
          <button
            id="tab_sudoku_btn"
            onClick={() => setActiveTab("sudoku")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "sudoku"
                ? "border-amber-500 text-amber-400 bg-[#11131a]"
                : "border-transparent text-[#6b7280] hover:text-[#e0e0e0]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>4x4 Mini Sudoku (+150)</span>
          </button>

          <button
            id="tab_color_btn"
            onClick={() => setActiveTab("color")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "color"
                ? "border-amber-500 text-amber-400 bg-[#11131a]"
                : "border-transparent text-[#6b7280] hover:text-[#e0e0e0]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chroma Memory (+100)</span>
          </button>

          <button
            id="tab_spot_btn"
            onClick={() => setActiveTab("spot")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "spot"
                ? "border-amber-500 text-amber-400 bg-[#11131a]"
                : "border-transparent text-[#6b7280] hover:text-[#e0e0e0]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Spot Discrepancy (+100)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-[#11131a]">
          {/* TAB 1: 4x4 SUDOKU */}
          {activeTab === "sudoku" && (
            <div className="max-w-md mx-auto space-y-4 text-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">4x4 Matrix Sudoku</h3>
                <p className="text-[11px] text-[#9ca3af] mt-1">
                  Fill empty cells with digits 1-4 so every row, column, and 2x2 quadrant contains unique numbers.
                </p>
              </div>

              <div className="inline-grid grid-cols-4 gap-1.5 p-3 bg-[#0a0b10] border border-[#2d2d3d] rounded-lg shadow-lg">
                {sudokuGrid.map((row, r) =>
                  row.map((val, c) => {
                    const isPrefilled = fixedPuzzle[r][c] !== 0;

                    return (
                      <input
                        key={`${r}-${c}`}
                        type="text"
                        maxLength={1}
                        value={val === 0 ? "" : val}
                        disabled={isPrefilled || sudokuSolved}
                        onChange={(e) => handleSudokuCell(r, c, e.target.value)}
                        className={`w-12 h-12 text-center text-lg font-mono font-black rounded border transition ${
                          isPrefilled
                            ? "bg-[#1a1c25] border-[#2d2d3d] text-[#6b7280] cursor-not-allowed"
                            : val !== 0
                            ? "bg-[#11131a] border-amber-500 text-amber-400"
                            : "bg-[#0a0b10] border-[#2d2d3d] text-white focus:border-amber-500/50"
                        }`}
                      />
                    );
                  })
                )}
              </div>

              {sudokuSolved && (
                <div className="p-3 rounded bg-[#1a1c25] border border-green-500/40 text-green-400 text-xs font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> 4x4 Sudoku Cleared! +150 Points Awarded!
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHROMA MEMORY */}
          {activeTab === "color" && (
            <div className="max-w-md mx-auto space-y-5 text-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chroma Neural Sequence</h3>
                <p className="text-[11px] text-[#9ca3af] mt-1">
                  Memorize the 5-pulse color pattern and repeat it in sequence.
                </p>
              </div>

              {colorStatus === "idle" && (
                <button
                  id="start_chroma_game_btn"
                  onClick={startColorGame}
                  className="px-6 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.2em] transition"
                >
                  Start 5-Pulse Sequence
                </button>
              )}

              {colorStatus === "showing" && (
                <div className="text-xs font-mono text-amber-400 font-bold animate-pulse">
                  Watch closely! Transmitting sequence...
                </div>
              )}

              {colorStatus === "playing" && (
                <div className="text-xs font-mono text-white font-bold">
                  Your turn! Progress: {playerSequence.length} / {sequence.length}
                </div>
              )}

              {/* 4 Color Pads */}
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => handleColorClick("cyan")}
                  disabled={colorStatus !== "playing"}
                  className={`h-24 rounded-lg border-2 transition ${
                    activeFlash === "cyan"
                      ? "bg-cyan-300 border-white shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                      : "bg-cyan-950/60 border-cyan-500/40 hover:bg-cyan-900/60"
                  }`}
                />
                <button
                  onClick={() => handleColorClick("amber")}
                  disabled={colorStatus !== "playing"}
                  className={`h-24 rounded-lg border-2 transition ${
                    activeFlash === "amber"
                      ? "bg-amber-300 border-white shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                      : "bg-amber-950/60 border-amber-500/40 hover:bg-amber-900/60"
                  }`}
                />
                <button
                  onClick={() => handleColorClick("purple")}
                  disabled={colorStatus !== "playing"}
                  className={`h-24 rounded-lg border-2 transition ${
                    activeFlash === "purple"
                      ? "bg-purple-300 border-white shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                      : "bg-purple-950/60 border-purple-500/40 hover:bg-purple-900/60"
                  }`}
                />
                <button
                  onClick={() => handleColorClick("emerald")}
                  disabled={colorStatus !== "playing"}
                  className={`h-24 rounded-lg border-2 transition ${
                    activeFlash === "emerald"
                      ? "bg-emerald-300 border-white shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                      : "bg-emerald-950/60 border-emerald-500/40 hover:bg-emerald-900/60"
                  }`}
                />
              </div>

              {colorStatus === "won" && (
                <div className="p-3 rounded bg-[#1a1c25] border border-green-500/40 text-green-400 text-xs font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Perfect Recall! +100 Points Awarded!
                </div>
              )}

              {colorStatus === "lost" && (
                <div className="space-y-2">
                  <p className="text-xs text-rose-400 font-bold">Sequence desync! Incorrect color clicked.</p>
                  <button
                    onClick={startColorGame}
                    className="px-4 py-1.5 rounded bg-[#1a1c25] border border-[#2d2d3d] text-xs text-white font-semibold"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SPOT THE DIFFERENCE */}
          {activeTab === "spot" && (
            <div className="max-w-lg mx-auto space-y-4 text-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Surveillance Monitor Discrepancies</h3>
                <p className="text-[11px] text-[#9ca3af] mt-1">
                  Inspect the camera feed below and identify the 3 anomalous targets.
                </p>
              </div>

              <div className="relative bg-[#0a0b10] border border-[#2d2d3d] rounded-lg p-6 h-64 flex flex-col justify-between overflow-hidden shadow-inner font-mono text-xs text-slate-300 select-none">
                <div className="flex justify-between text-[#6b7280] text-[10px]">
                  <span>CAM-04 LAB ARCHIVE</span>
                  <span className="text-amber-500 animate-pulse">● LIVE TELEMETRY</span>
                </div>

                {/* Simulated Room Interior with click targets */}
                <div className="relative flex-1 my-2 border border-[#2d2d3d] rounded bg-[#11131a] p-4 flex items-center justify-around">
                  {spotLocations.map((spot) => {
                    const isFound = foundSpots.includes(spot.id);

                    return (
                      <button
                        key={spot.id}
                        onClick={() => handleSpotClick(spot.id)}
                        className={`p-3 rounded border transition flex flex-col items-center gap-1 ${
                          isFound
                            ? "bg-[#1a1c25] border-green-500/50 text-green-400"
                            : "bg-[#0a0b10] border-[#2d2d3d] hover:border-amber-500/50 text-white"
                        }`}
                      >
                        <span className="text-xl">
                          {spot.id === 1 ? "☕" : spot.id === 2 ? "🕰" : "🚨"}
                        </span>
                        <span className="text-[10px] font-bold">
                          {isFound ? `✓ ${spot.name}` : `Inspect ${spot.name.split(" ")[0]}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  Discrepancies Resolved: {foundSpots.length} / 3
                </div>
              </div>

              {foundSpots.length === 3 && (
                <div className="p-3 rounded bg-[#1a1c25] border border-green-500/40 text-green-400 text-xs font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> All Differences Located! +100 Points Awarded!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
