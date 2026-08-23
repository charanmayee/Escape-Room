import React from "react";
import { Lock, Unlock, Clock, Award, Compass, Search, Lightbulb, ShieldAlert, Sparkles, ShieldCheck, Flame, AlertTriangle, Map } from "lucide-react";
import { ClueItem, DifficultyLevel } from "../types";
import { FacilityFloorPlan } from "./FacilityFloorPlan";

interface SidebarProps {
  playerName: string;
  score: number;
  remainingTime: number;
  currentRoom: number;
  difficulty: DifficultyLevel;
  unlockedRooms: number[];
  discoveredClues: ClueItem[];
  hintsRemaining: number;
  maxHints: number;
  onRequestHint: () => void;
  onSelectRoom: (room: number) => void;
  onOpenBonusModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  playerName,
  score,
  remainingTime,
  currentRoom,
  difficulty,
  unlockedRooms,
  discoveredClues,
  hintsRemaining,
  maxHints,
  onRequestHint,
  onSelectRoom,
  onOpenBonusModal,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const foundClues = discoveredClues.filter((c) => c.discovered);

  const getDiffLabel = () => {
    switch (difficulty) {
      case "Easy":
        return { label: "Easy Cadet", icon: ShieldCheck, color: "text-emerald-400" };
      case "Hard":
        return { label: "Hard Master", icon: AlertTriangle, color: "text-rose-400" };
      default:
        return { label: "Medium Operative", icon: Flame, color: "text-amber-400" };
    }
  };

  const diffInfo = getDiffLabel();
  const DiffIcon = diffInfo.icon;

  return (
    <aside id="game_sidebar" className="w-full lg:w-80 bg-[#11131a] border-b lg:border-b-0 lg:border-r border-[#2d2d3d] p-3.5 sm:p-4 flex flex-col gap-4 text-[#e0e0e0] shrink-0">
      {/* Tactical Facility Blueprint Floor Plan */}
      <FacilityFloorPlan
        currentRoom={currentRoom}
        unlockedRooms={unlockedRooms}
        discoveredClues={discoveredClues}
        onSelectRoom={onSelectRoom}
      />

      {/* Player Assets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] uppercase tracking-widest text-[#6b7280] font-bold">
            Player Assets
          </h3>
          <span className="text-[10px] text-amber-500/80 font-mono">
            {foundClues.length} Collected
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {foundClues.length === 0 ? (
            <>
              <div className="h-12 bg-[#1a1c25] border border-[#2d2d3d] rounded flex items-center justify-center text-xl grayscale opacity-30">
                🔑
              </div>
              <div className="h-12 bg-[#1a1c25] border border-[#2d2d3d] rounded flex items-center justify-center text-xl grayscale opacity-30">
                📜
              </div>
              <div className="h-12 bg-[#1a1c25] border border-[#2d2d3d] rounded flex items-center justify-center text-xl grayscale opacity-30">
                🔦
              </div>
            </>
          ) : (
            <>
              {foundClues.slice(0, 3).map((clue) => (
                <div
                  key={clue.id}
                  className="h-12 bg-[#1a1c25] border border-amber-500/50 rounded flex items-center justify-center text-xl shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] relative group"
                  title={`${clue.name}: ${clue.text}`}
                >
                  <span>{clue.icon}</span>
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-amber-400">
                    R{clue.roomNumber}
                  </span>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 3 - foundClues.length) }).map((_, idx) => (
                <div
                  key={`empty_${idx}`}
                  className="h-12 bg-[#1a1c25] border border-[#2d2d3d] rounded flex items-center justify-center text-xl grayscale opacity-20"
                >
                  🔒
                </div>
              ))}
            </>
          )}
        </div>

        {foundClues.length > 0 && (
          <div className="mt-2.5 max-h-32 overflow-y-auto space-y-1.5 text-xs">
            {foundClues.map((clue) => (
              <div key={clue.id} className="p-2 rounded bg-[#1a1c25] border border-[#2d2d3d] text-[#e0e0e0]">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5 text-[11px]">
                  <span>{clue.icon}</span>
                  <span>{clue.name}</span>
                  <span className="text-[9px] text-[#6b7280] ml-auto font-mono">Room {clue.roomNumber}</span>
                </div>
                <p className="text-[10px] text-[#9ca3af] mt-0.5 leading-tight">{clue.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Hints Bar & Request AI Hint / Bonus */}
      <div className="mt-auto pt-4 border-t border-[#2d2d3d] space-y-3">
        <div className="bg-[#1a1c25] rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">
              Available Hints
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {hintsRemaining}/{maxHints}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: maxHints }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full ${
                  hintsRemaining > idx
                    ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                    : "bg-[#2d2d3d]"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          id="sidebar_bonus_games_btn"
          onClick={onOpenBonusModal}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-[#0a0b10] font-bold rounded text-xs transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bonus Vault (+350 XP)</span>
        </button>
      </div>
    </aside>
  );
};
