import React, { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  ArrowLeft,
  RefreshCw,
  Radio,
  Clock,
  Search,
  Zap,
} from "lucide-react";
import { LeaderboardEntry } from "../types";
import { subscribeLeaderboard } from "../services/firebase";
import { playKeyClickSound } from "../utils/audio";

interface LeaderboardViewProps {
  onBack: () => void;
  onSelectDifficulty?: (diff: any) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterDiff, setFilterDiff] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFallbackLeaderboard = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.leaderboard)) {
          setEntries(data.leaderboard);
          setLastUpdated(new Date());
        }
      }
    } catch (e) {
      console.warn("Fallback leaderboard fetch warning:", e);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    // 1. Subscribe to real-time Firestore Leaderboard
    const unsubscribe = subscribeLeaderboard(
      (liveEntries) => {
        if (liveEntries && liveEntries.length > 0) {
          setEntries(liveEntries);
          setLastUpdated(new Date());
          setLoading(false);
        } else {
          // If firestore collection is newly created or empty, fetch server fallback
          fetchFallbackLeaderboard();
        }
      },
      () => {
        fetchFallbackLeaderboard();
      }
    );

    return () => unsubscribe();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  // Filtered entries
  const filteredEntries = entries.filter((item) => {
    if (filterDiff !== "All") {
      if ((item.difficulty || "Medium") !== filterDiff) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return item.player.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200 font-mono">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="leaderboard_back_btn"
          onClick={() => {
            playKeyClickSound();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] text-[#e0e0e0] hover:text-white hover:bg-[#222533] transition text-xs font-semibold uppercase tracking-wider shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>Back to Game</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0b10] border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Firestore Real-Time Sync</span>
          </div>

          <button
            id="refresh_leaderboard_btn"
            onClick={() => {
              playKeyClickSound();
              fetchFallbackLeaderboard(true);
            }}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] text-[#9ca3af] hover:text-amber-400 hover:bg-[#222533] transition text-xs font-bold uppercase"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? "animate-spin text-amber-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 rounded-2xl bg-[#1a1c25] border border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Trophy className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white uppercase">
          Live Operative <span className="font-black text-amber-500 italic">Hall of Fame</span>
        </h1>
        <p className="text-[#9ca3af] text-xs sm:text-sm max-w-lg mx-auto">
          Cloud-synchronized rankings of operatives who completed challenges across the facility.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#11131a] border border-[#2d2d3d] rounded-xl">
        {/* Tier Tabs */}
        <div className="flex items-center gap-1 bg-[#0a0b10] p-1 rounded-lg border border-[#2d2d3d] text-xs overflow-x-auto">
          {(["All", "Easy", "Medium", "Hard"] as const).map((tab) => {
            return (
              <button
                key={tab}
                id={`filter_${tab.toLowerCase()}_btn`}
                onClick={() => {
                  playKeyClickSound();
                  setFilterDiff(tab);
                }}
                className={`px-3 py-1 rounded transition font-bold ${
                  filterDiff === tab
                    ? "bg-amber-500 text-[#0a0b10]"
                    : "text-[#8c94a8] hover:text-white"
                }`}
              >
                {tab === "All" ? "All Tiers" : tab}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6b7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search_operative_input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operative name..."
            className="w-full bg-[#0a0b10] border border-[#2d2d3d] focus:border-amber-500/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#5a6278] outline-none"
          />
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#0a0b10] border-b border-[#2d2d3d] text-[#6b7280] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-14">Rank</th>
                <th className="py-3.5 px-4">Operative</th>
                <th className="py-3.5 px-4 text-center">Difficulty</th>
                <th className="py-3.5 px-4 text-right">Score</th>
                <th className="py-3.5 px-4 text-center">Chambers</th>
                <th className="py-3.5 px-4 text-right">Time Left</th>
                <th className="py-3.5 px-4 text-right hidden sm:table-cell">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d3d]/60 text-[#e0e0e0]">
              {loading && entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6b7280]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                    <span>Synchronizing with cloud Firestore database...</span>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center space-y-3">
                    <div className="text-3xl">🎯</div>
                    <div className="text-sm text-white font-bold">
                      {searchQuery ? "No operatives matching search filter" : "No scores recorded yet in this category"}
                    </div>
                    <p className="text-xs text-[#9ca3af] max-w-md mx-auto">
                      Start a new escape mission, clear facility chambers, and your score will appear here instantly!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => {
                  const isTop3 = index < 3 && filterDiff === "All" && !searchQuery;
                  const medalColors = ["text-amber-400", "text-slate-300", "text-amber-600"];
                  const diff = entry.difficulty || "Medium";

                  return (
                    <tr
                      key={`${entry.player}_${index}`}
                      className="hover:bg-[#1a1c25]/60 transition"
                    >
                      <td className="py-3.5 px-4 text-center font-bold">
                        {isTop3 ? (
                          <span className={`inline-flex items-center gap-1 font-black ${medalColors[index]}`}>
                            <Medal className="w-4 h-4" />#{index + 1}
                          </span>
                        ) : (
                          <span className="text-[#6b7280]">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#1e2333] border border-[#2d2d3d] flex items-center justify-center text-[10px] text-amber-400">
                            {entry.player.charAt(0).toUpperCase()}
                          </div>
                          <span>{entry.player}</span>
                          {entry.rooms_completed >= 5 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-950/80 text-green-400 border border-green-500/40 font-normal">
                              Escaped
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            diff === "Easy"
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                              : diff === "Hard"
                              ? "bg-rose-950/60 border-rose-500/40 text-rose-400"
                              : "bg-amber-950/60 border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {diff}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-400">
                        {entry.score.toLocaleString()} <span className="text-[10px] text-[#6b7280] font-normal">pts</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded bg-[#0a0b10] border border-[#2d2d3d] text-amber-500 text-xs font-bold">
                          {entry.rooms_completed}/5
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-green-400">
                        ⏱ {formatTime(entry.time_remaining)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[11px] text-[#6b7280] hidden sm:table-cell">
                        {formatDate(entry.completed_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-[#0a0b10] border-t border-[#2d2d3d] px-4 py-2.5 flex flex-wrap items-center justify-between text-[10px] text-[#6b7280]">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-green-500" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <span>Total Operative Records: {filteredEntries.length} of {entries.length}</span>
        </div>
      </div>
    </div>
  );
};
