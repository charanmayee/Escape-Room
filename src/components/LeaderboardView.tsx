import React, { useEffect, useState } from "react";
import { Trophy, Medal, ArrowLeft, RefreshCw } from "lucide-react";
import { LeaderboardEntry } from "../types";

interface LeaderboardViewProps {
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        // Client-side deduplication safeguard: keep 1 best score per player
        const playerMap = new Map<string, LeaderboardEntry>();
        for (const entry of data.leaderboard) {
          if (!entry || !entry.player) continue;
          const key = entry.player.trim().toLowerCase();
          const existing = playerMap.get(key);
          if (!existing || entry.score > existing.score) {
            playerMap.set(key, entry);
          }
        }
        const sorted = Array.from(playerMap.values()).sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.rooms_completed !== a.rooms_completed) return b.rooms_completed - a.rooms_completed;
          return b.time_remaining - a.time_remaining;
        });
        setEntries(sorted);
      }
    } catch (e) {
      console.error("Failed to load leaderboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          id="leaderboard_back_btn"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#1a1c25] border border-[#2d2d3d] text-[#e0e0e0] hover:text-white hover:bg-[#222533] transition text-xs font-semibold uppercase tracking-wider font-mono"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          Back to Game
        </button>

        <div className="flex items-center gap-2">
          <button
            id="refresh_leaderboard_btn"
            onClick={fetchLeaderboard}
            className="p-2 rounded bg-[#1a1c25] border border-[#2d2d3d] text-[#9ca3af] hover:text-amber-400 hover:bg-[#222533] transition text-xs"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-[#1a1c25] border border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white uppercase font-mono">
          AI Escape Room <span className="font-bold text-amber-500 italic">Hall of Fame</span>
        </h1>
        <p className="text-[#9ca3af] text-xs sm:text-sm font-mono">
          Ranked by Highest Score, Chambers Cleared, and Fastest Evacuation Time
        </p>
      </div>

      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead className="bg-[#0a0b10] border-b border-[#2d2d3d] text-[#6b7280] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Operative</th>
                <th className="py-3.5 px-4 text-center">Tier</th>
                <th className="py-3.5 px-4 text-right">Score</th>
                <th className="py-3.5 px-4 text-center">Rooms</th>
                <th className="py-3.5 px-4 text-right">Time Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d3d]/60 text-[#e0e0e0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6b7280]">
                    Loading Hall of Fame records...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6b7280]">
                    No escape runs recorded yet. Be the first to escape!
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => {
                  const isTop3 = index < 3;
                  const medalColors = ["text-amber-400", "text-slate-300", "text-amber-600"];
                  const diff = entry.difficulty || "Medium";

                  return (
                    <tr key={index} className="hover:bg-[#1a1c25]/50 transition">
                      <td className="py-3.5 px-4 font-bold">
                        {isTop3 ? (
                          <span className={`flex items-center gap-1 font-black ${medalColors[index]}`}>
                            <Medal className="w-4 h-4" />#{index + 1}
                          </span>
                        ) : (
                          <span className="text-[#6b7280]">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span>{entry.player}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          diff === "Easy"
                            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                            : diff === "Hard"
                            ? "bg-rose-950/60 border-rose-500/40 text-rose-400"
                            : "bg-amber-950/60 border-amber-500/40 text-amber-400"
                        }`}>
                          {diff}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-400">
                        {entry.score.toLocaleString()} <span className="text-[10px] text-[#6b7280] font-normal">pts</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-[#0a0b10] border border-[#2d2d3d] text-amber-500 text-xs font-bold">
                          {entry.rooms_completed}/5
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-green-400">
                        ⏱ {formatTime(entry.time_remaining)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
