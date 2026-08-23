import React, { useEffect, useState, useRef } from "react";
import { Trophy, Award, Clock, ArrowRight, RotateCcw, ShieldCheck, Sparkles, CheckCircle2, Flame, AlertTriangle } from "lucide-react";
import { playSuccessChime, playKeyClickSound } from "../utils/audio";
import { DifficultyLevel } from "../types";

interface VictoryModalProps {
  playerName: string;
  baseScore: number;
  remainingTime: number;
  initialTime?: number;
  difficulty?: DifficultyLevel;
  unlockedRoomsCount: number;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  playerName,
  baseScore,
  remainingTime,
  initialTime = 900,
  difficulty = "Medium",
  unlockedRoomsCount,
  onPlayAgain,
  onViewLeaderboard,
}) => {
  const multiplier = difficulty === "Hard" ? 2.0 : difficulty === "Medium" ? 1.5 : 1.0;
  const timeBonus = Math.round(remainingTime * 2 * multiplier);
  const escapeBonus = Math.round(500 * multiplier);
  const totalScore = baseScore + escapeBonus + timeBonus;
  const [saved, setSaved] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    playSuccessChime();

    // Automatically submit score to backend leaderboard
    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player: playerName || "Agent Phoenix",
        score: totalScore,
        rooms_completed: 5,
        time_remaining: remainingTime,
        difficulty: difficulty,
      }),
    })
      .then((res) => res.json())
      .then(() => setSaved(true))
      .catch((err) => console.error("Failed to save score:", err));
  }, [playerName, remainingTime, totalScore, difficulty]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getDiffBadge = () => {
    if (difficulty === "Easy") {
      return { text: "Easy Cadet (1.0×)", cls: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40" };
    }
    if (difficulty === "Hard") {
      return { text: "Hard Master (2.0×)", cls: "text-rose-400 border-rose-500/40 bg-rose-950/40" };
    }
    return { text: "Medium Operative (1.5×)", cls: "text-amber-400 border-amber-500/40 bg-amber-950/40" };
  };

  const diffBadge = getDiffBadge();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-2xl w-full max-w-lg p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Amber glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Icon */}
        <div className="inline-flex p-4 rounded-xl bg-amber-500 text-[#0a0b10] shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <Trophy className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className={`px-2.5 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${diffBadge.cls}`}>
              {diffBadge.text}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white uppercase font-mono">
            Facility Lockdown <span className="font-black text-amber-500 italic">Overridden</span>
          </h2>
          <p className="text-xs text-[#9ca3af] font-mono">
            Operative {playerName} escaped in {formatTime(Math.max(0, initialTime - remainingTime))}!
          </p>
        </div>

        {/* Score Breakdown Table */}
        <div className="bg-[#0a0b10] border border-[#2d2d3d] rounded-xl p-4 text-xs space-y-2 text-[#9ca3af] text-left font-mono">
          <div className="flex justify-between items-center py-1.5 border-b border-[#2d2d3d]">
            <span className="flex items-center gap-1.5 text-[#e0e0e0]">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Chamber & Puzzle XP
            </span>
            <span className="font-mono font-bold text-white">+{baseScore} pts</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-[#2d2d3d]">
            <span className="flex items-center gap-1.5 text-[#e0e0e0]">
              <Sparkles className="w-4 h-4 text-amber-400" /> Master Escape Bonus ({multiplier}×)
            </span>
            <span className="font-mono font-bold text-amber-400">+{escapeBonus} pts</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-[#2d2d3d]">
            <span className="flex items-center gap-1.5 text-[#e0e0e0]">
              <Clock className="w-4 h-4 text-green-400" /> Time Bonus ({formatTime(remainingTime)} @ {multiplier}×)
            </span>
            <span className="font-mono font-bold text-green-400">+{timeBonus} pts</span>
          </div>

          <div className="flex justify-between items-center pt-2 text-xs font-black text-white">
            <span className="text-amber-500 uppercase tracking-wider">Total Final Score:</span>
            <span className="text-lg font-mono text-amber-400 font-black">{totalScore.toLocaleString()} PTS</span>
          </div>
        </div>

        {saved && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-green-400 font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" /> Score successfully registered on Global Leaderboard!
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            id="victory_leaderboard_btn"
            onClick={onViewLeaderboard}
            className="flex-1 py-3 px-4 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] hover:bg-[#222533] text-[#e0e0e0] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 font-mono"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Leaderboard</span>
          </button>

          <button
            id="victory_play_again_btn"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] text-xs font-black uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-mono"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
