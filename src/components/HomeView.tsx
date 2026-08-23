import React, { useState } from "react";
import { Lock, Play, ShieldAlert, Sparkles, Trophy, BookOpen, KeyRound, Cpu, Eye, Binary, Zap, ShieldCheck, Flame, AlertTriangle } from "lucide-react";
import { playSuccessChime, playKeyClickSound } from "../utils/audio";
import { DifficultyLevel } from "../types";
import { isValidPlayerName, sanitizePlayerName } from "../utils/playerValidation";

interface HomeViewProps {
  onStartGame: (name: string, difficulty: DifficultyLevel) => void;
  onOpenLeaderboard: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartGame,
  onOpenLeaderboard,
}) => {
  const [nameInput, setNameInput] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("Medium");
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizePlayerName(nameInput);
    if (!clean || clean.length < 2) {
      setNameError("Codename must be at least 2 characters.");
      return;
    }
    if (!isValidPlayerName(clean)) {
      setNameError("Guest and generic placeholder names (e.g. 'Guest', 'Player', 'Agent') cannot be registered on the real-time leaderboard. Please enter your unique codename.");
      return;
    }
    setNameError(null);
    playSuccessChime();
    onStartGame(clean, selectedDifficulty);
  };

  const difficultyDetails: Record<DifficultyLevel, {
    label: string;
    time: string;
    seconds: number;
    hints: number;
    multiplier: string;
    multiplierNum: number;
    badgeColor: string;
    borderActive: string;
    bgActive: string;
    icon: any;
    desc: string;
  }> = {
    Easy: {
      label: "Easy (Cadet)",
      time: "20:00",
      seconds: 1200,
      hints: 5,
      multiplier: "1.0× XP",
      multiplierNum: 1.0,
      badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
      borderActive: "border-emerald-500 bg-emerald-950/30 text-emerald-300",
      bgActive: "bg-emerald-500 text-[#0a0b10]",
      icon: ShieldCheck,
      desc: "Generous 20 min timer, 5 available hints, and beginner-friendly puzzle clues.",
    },
    Medium: {
      label: "Medium (Operative)",
      time: "15:00",
      seconds: 900,
      hints: 3,
      multiplier: "1.5× XP",
      multiplierNum: 1.5,
      badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
      borderActive: "border-amber-500 bg-amber-950/30 text-amber-300",
      bgActive: "bg-amber-500 text-[#0a0b10]",
      icon: Flame,
      desc: "Standard 15 min tactical speedrun, 3 hints, and balanced neural puzzles.",
    },
    Hard: {
      label: "Hard (Master)",
      time: "10:00",
      seconds: 600,
      hints: 1,
      multiplier: "2.0× XP",
      multiplierNum: 2.0,
      badgeColor: "text-rose-400 border-rose-500/40 bg-rose-950/40",
      borderActive: "border-rose-500 bg-rose-950/30 text-rose-300",
      bgActive: "bg-rose-500 text-white",
      icon: AlertTriangle,
      desc: "Extreme 10 min emergency breach, only 1 hint, and double score reward!",
    },
  };

  const chambers = [
    {
      num: 1,
      title: "Campus Dorms",
      puzzle: "Word Scramble",
      icon: BookOpen,
      desc: "Unscramble college coding terms and extract the first letters for the room master passkey.",
    },
    {
      num: 2,
      title: "Cyber Archives",
      puzzle: "Decapitated Cipher",
      icon: KeyRound,
      desc: "Restore missing boundary characters across categorized patterns to uncover ESCAPE2026.",
    },
    {
      num: 3,
      title: "AI Sentinel Core",
      puzzle: "Neural AI Riddles",
      icon: Cpu,
      desc: "Synthesized riddle challenges powered by Gemini AI with tiered hint score penalties.",
    },
    {
      num: 4,
      title: "Rebus Gallery",
      puzzle: "Visual Wordplay",
      icon: Eye,
      desc: "Decode spatial rebuses (Tricycle, Man Overboard) to reveal the classified safe code 4827.",
    },
    {
      num: 5,
      title: "Master Core",
      puzzle: "Matchstick Equations",
      icon: Binary,
      desc: "Move 1 matchstick to balance equations and solve Fibonacci sequence matrices for escape.",
    },
  ];

  const currentDiff = difficultyDetails[selectedDifficulty];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#11131a] border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Tactical Facility Breach Active // {currentDiff.time} Countdown // {selectedDifficulty.toUpperCase()} LEVEL
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans">
          Escape Room <span className="text-amber-500 text-glow-amber">Control</span>
        </h1>

        <p className="max-w-2xl mx-auto text-[#9ca3af] text-xs sm:text-sm leading-relaxed">
          You are locked inside the advanced computer science facility after hours. Select your security clearance level, solve word scrambles, decapitated ciphers, AI neural riddles, and matchstick blast locks before security seals all exits.
        </p>

        {/* Start Game Form Card */}
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto mt-6 bg-[#11131a] border border-[#2d2d3d] p-6 rounded-xl shadow-2xl relative text-left"
        >
          <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-[#0a0b10] text-[10px] font-bold rounded uppercase tracking-tighter">
            Mission Authorization & Security Tier
          </div>

          <div className="space-y-4 pt-1">
            {/* Player Name Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#6b7280] font-mono">
                <label htmlFor="player_codename_input">Player Name</label>
                <span className="text-amber-500 font-bold">{currentDiff.time} Countdown</span>
              </div>
              <input
                id="player_codename_input"
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="ENTER PLAYER NAME (E.G. CIPHER_7)..."
                maxLength={25}
                required
                className={`w-full bg-[#0a0b10] border rounded-lg px-4 py-3 text-white placeholder-[#374151] focus:outline-none uppercase tracking-[0.2em] font-mono text-xs ${
                  nameError ? "border-rose-500 focus:border-rose-400" : "border-[#2d2d3d] focus:border-amber-500/50"
                }`}
              />
              {nameError && (
                <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1.5 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Difficulty Level Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#6b7280] font-mono">
                <span>Select Security Difficulty</span>
                <span className="text-amber-400 font-bold">{currentDiff.multiplier} Multiplier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map((lvl) => {
                  const conf = difficultyDetails[lvl];
                  const isSelected = selectedDifficulty === lvl;
                  const Icon = conf.icon;

                  return (
                    <button
                      key={lvl}
                      type="button"
                      id={`difficulty_btn_${lvl.toLowerCase()}`}
                      onClick={() => {
                        setSelectedDifficulty(lvl);
                        playKeyClickSound();
                      }}
                      className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? `${conf.borderActive} shadow-[0_0_12px_rgba(245,158,11,0.2)]`
                          : "bg-[#0a0b10] border-[#2d2d3d] text-[#9ca3af] hover:border-[#4b5563] hover:text-[#e0e0e0]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-black uppercase flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          {lvl}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? conf.badgeColor : "bg-[#11131a] text-[#6b7280]"
                        }`}>
                          {conf.multiplier}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono flex items-center justify-between text-[#6b7280]">
                        <span>⏱ {conf.time}</span>
                        <span>💡 {conf.hints} hints</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-[#9ca3af] font-mono bg-[#0a0b10] p-2.5 rounded border border-[#2d2d3d]/80 leading-tight">
                <span className="text-amber-400 font-bold uppercase">{selectedDifficulty} Protocol:</span> {currentDiff.desc}
              </p>
            </div>

            {/* Submit Start Button */}
            <button
              id="start_escape_run_btn"
              type="submit"
              onClick={playKeyClickSound}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.25em] rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-[#0a0b10]" />
              <span>Start Game</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          id="home_view_leaderboard_btn"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#11131a] border border-[#2d2d3d] hover:border-amber-500/40 text-[#9ca3af] hover:text-white text-xs font-semibold uppercase tracking-wider transition"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Global Leaderboard</span>
        </button>
      </div>

      {/* Room Blueprints Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 font-mono">
            <Lock className="w-4 h-4 text-amber-500" />
            Facility Blueprint & Security Chambers
          </h2>
          <span className="text-[10px] text-amber-500/80 font-mono uppercase tracking-widest">
            5 Primary + 3 Bonus Vaults
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {chambers.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.num}
                className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 hover:bg-[#161822] transition relative overflow-hidden group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0a0b10] border border-[#2d2d3d] text-amber-500">
                      Chamber 0{c.num}
                    </span>
                    <div className="p-1.5 rounded bg-[#1a1c25] border border-[#2d2d3d] text-amber-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-tight group-hover:text-amber-400 transition">
                      {c.title}
                    </h3>
                    <p className="text-[11px] font-medium text-amber-500/90 font-mono">{c.puzzle}</p>
                  </div>
                  <p className="text-[10px] text-[#9ca3af] leading-normal">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Rules & Scoring Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-mono text-amber-500">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Operative Field Guidelines
          </h3>
          <ul className="text-xs text-[#9ca3af] space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong>Sequential Clearance:</strong> Solve the puzzle in each chamber to discover the master door code and breach the next chamber.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong>Difficulty Tiers:</strong> Easy (20 min, 5 hints, 1.0× XP), Medium (15 min, 3 hints, 1.5× XP), Hard (10 min, 1 hint, 2.0× XP).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong>Bonus Vault Games:</strong> Complete 4x4 Sudoku, Chroma Neural Sequence, and Spot Difference for +350 bonus score.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-mono text-amber-500">
            <Trophy className="w-4 h-4 text-amber-500" />
            Scoring Matrix & Tier Multipliers
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-[#0a0b10] border border-[#2d2d3d]">
              <div className="text-[10px] uppercase tracking-widest text-[#6b7280]">Easy Tier</div>
              <div className="text-emerald-400 font-mono font-bold text-sm">1.0× BASE XP</div>
            </div>
            <div className="p-2.5 rounded bg-[#0a0b10] border border-[#2d2d3d]">
              <div className="text-[10px] uppercase tracking-widest text-[#6b7280]">Medium Tier</div>
              <div className="text-amber-400 font-mono font-bold text-sm">1.5× BONUS XP</div>
            </div>
            <div className="p-2.5 rounded bg-[#0a0b10] border border-[#2d2d3d]">
              <div className="text-[10px] uppercase tracking-widest text-[#6b7280]">Hard Tier</div>
              <div className="text-rose-400 font-mono font-bold text-sm">2.0× DOUBLE XP</div>
            </div>
            <div className="p-2.5 rounded bg-[#0a0b10] border border-[#2d2d3d]">
              <div className="text-[10px] uppercase tracking-widest text-[#6b7280]">Master Escape</div>
              <div className="text-white font-mono font-bold text-sm">+500 + 2×TIME</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
