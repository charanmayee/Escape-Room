import React, { useState } from "react";
import { Lock, CheckCircle2, Navigation, Eye, Zap, Shield, Sparkles, MapPin, AlertOctagon, Terminal } from "lucide-react";
import { ClueItem } from "../types";
import { playKeyClickSound, playErrorBuzzer } from "../utils/audio";

interface FacilityFloorPlanProps {
  currentRoom: number;
  unlockedRooms: number[];
  discoveredClues: ClueItem[];
  onSelectRoom: (room: number) => void;
}

interface SectorInfo {
  num: number;
  code: string;
  name: string;
  shortName: string;
  desc: string;
  type: string;
  x: number; // percentage in floor plan
  y: number;
  width: number;
  height: number;
  corridorTo?: number; // target room number for connector
}

const SECTORS: SectorInfo[] = [
  {
    num: 1,
    code: "SEC-01",
    name: "Campus Dorms & Entry",
    shortName: "Dorms & Entry",
    desc: "Initial security breach & word scramble scrambler",
    type: "Word Scramble",
    x: 4,
    y: 6,
    width: 44,
    height: 38,
    corridorTo: 2,
  },
  {
    num: 2,
    code: "SEC-02",
    name: "Cipher Lab & Terminals",
    shortName: "Cipher Lab",
    desc: "Decapitated pattern decoder & cryptographic mainframe",
    type: "Decapitated Cipher",
    x: 52,
    y: 6,
    width: 44,
    height: 38,
    corridorTo: 3,
  },
  {
    num: 3,
    code: "SEC-03",
    name: "AI Sentinel Core",
    shortName: "AI Sentinel Core",
    desc: "Central neural reasoning riddle mainframe",
    type: "Neural Riddle",
    x: 28,
    y: 48,
    width: 44,
    height: 24,
    corridorTo: 4,
  },
  {
    num: 4,
    code: "SEC-04",
    name: "Visual Gallery Archive",
    shortName: "Visual Gallery",
    desc: "Rebus puzzle matrix & biometric camera vault",
    type: "Rebus Matrix",
    x: 4,
    y: 76,
    width: 44,
    height: 20,
    corridorTo: 5,
  },
  {
    num: 5,
    code: "SEC-05",
    name: "Blast Lock Emergency Exit",
    shortName: "Blast Exit",
    desc: "Final matchstick balance lock to freedom",
    type: "Master Blast Vault",
    x: 52,
    y: 76,
    width: 44,
    height: 20,
  },
];

export const FacilityFloorPlan: React.FC<FacilityFloorPlanProps> = ({
  currentRoom,
  unlockedRooms,
  discoveredClues,
  onSelectRoom,
}) => {
  const [hoveredSector, setHoveredSector] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"blueprint" | "detail">("blueprint");

  const exploredPercentage = Math.round((unlockedRooms.length / 5) * 100);
  const selectedSector = SECTORS.find((s) => s.num === (hoveredSector ?? currentRoom)) || SECTORS[0];
  const isSectorUnlocked = (num: number) => unlockedRooms.includes(num);
  const isSectorCurrent = (num: number) => currentRoom === num;
  const isSectorCleared = (num: number) => isSectorUnlocked(num) && !isSectorCurrent(num);

  const handleRoomClick = (roomNum: number) => {
    if (isSectorUnlocked(roomNum)) {
      playKeyClickSound();
      onSelectRoom(roomNum);
    } else {
      playErrorBuzzer();
    }
  };

  return (
    <div className="bg-[#0e1017] border border-[#2d2d3d] rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Blueprint Header */}
      <div className="bg-[#141722] px-3.5 py-2.5 border-b border-[#2d2d3d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <div>
            <h4 className="text-[11px] font-mono font-black uppercase tracking-widest text-white flex items-center gap-1.5">
              <span>Facility Floor Plan</span>
              <span className="text-amber-500 text-[9px] px-1 py-0.2 bg-amber-950/60 border border-amber-500/30 rounded">
                SUB-02
              </span>
            </h4>
            <div className="text-[9px] font-mono text-[#6b7280]">
              SCALE: 1:250 // SECTORS: 5 ZONES
            </div>
          </div>
        </div>

        {/* Exploration Metric */}
        <div className="text-right">
          <div className="text-[10px] font-mono font-bold text-amber-400">
            {exploredPercentage}% MAPPED
          </div>
          <div className="w-16 h-1.5 bg-[#1a1c25] rounded-full overflow-hidden border border-[#2d2d3d] mt-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-green-400 transition-all duration-500 rounded-full"
              style={{ width: `${exploredPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Blueprint Tactical Canvas Map */}
      <div className="p-3 bg-[#0a0c12] relative select-none">
        {/* Architectural Background Grid */}
        <div
          className="w-full relative rounded-lg border border-[#1e2333] overflow-hidden bg-[#07080d]"
          style={{
            height: "260px",
            backgroundImage: `
              linear-gradient(to right, rgba(45, 55, 75, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(45, 55, 75, 0.25) 1px, transparent 1px),
              linear-gradient(to right, rgba(245, 158, 11, 0.04) 5px, transparent 5px)
            `,
            backgroundSize: "20px 20px, 20px 20px, 100px 100px",
          }}
        >
          {/* Blueprint Measurement Crosshairs & Watermark */}
          <div className="absolute top-1 left-2 text-[8px] font-mono text-[#3b4254] tracking-widest pointer-events-none">
            GRID: 42°36&apos;N // SEC-ALPHA
          </div>
          <div className="absolute bottom-1 right-2 text-[8px] font-mono text-[#3b4254] tracking-widest pointer-events-none">
            PRESSURE: 1.02 ATM // SEALED
          </div>
          <div className="absolute top-1 right-2 text-[8px] font-mono text-[#3b4254] tracking-widest pointer-events-none">
            EMERGENCY PROTOCOL
          </div>

          {/* SVG Power Conduits / Corridors Connecting Sectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {/* Corridor 1 -> 2 (Top horizontal) */}
            <line
              x1="48%"
              y1="25%"
              x2="52%"
              y2="25%"
              stroke={unlockedRooms.includes(2) ? "#10b981" : "#2d3748"}
              strokeWidth="4"
              strokeDasharray={unlockedRooms.includes(2) ? "none" : "3 3"}
            />
            {/* Corridor 2 -> 3 (Right vertical down to center) */}
            <path
              d="M 74% 44% L 74% 52% L 72% 52%"
              fill="none"
              stroke={unlockedRooms.includes(3) ? "#10b981" : "#2d3748"}
              strokeWidth="4"
              strokeDasharray={unlockedRooms.includes(3) ? "none" : "3 3"}
            />
            {/* Corridor 3 -> 4 (Center to Bottom-Left) */}
            <path
              d="M 28% 60% L 26% 60% L 26% 76%"
              fill="none"
              stroke={unlockedRooms.includes(4) ? "#10b981" : "#2d3748"}
              strokeWidth="4"
              strokeDasharray={unlockedRooms.includes(4) ? "none" : "3 3"}
            />
            {/* Corridor 4 -> 5 (Bottom horizontal to Vault) */}
            <line
              x1="48%"
              y1="86%"
              x2="52%"
              y2="86%"
              stroke={unlockedRooms.includes(5) ? "#10b981" : "#2d3748"}
              strokeWidth="4"
              strokeDasharray={unlockedRooms.includes(5) ? "none" : "3 3"}
            />
          </svg>

          {/* Render 5 Sectors on Floor Plan */}
          {SECTORS.map((sector) => {
            const unlocked = isSectorUnlocked(sector.num);
            const current = isSectorCurrent(sector.num);
            const cleared = isSectorCleared(sector.num);
            const cluesInSector = discoveredClues.filter((c) => c.roomNumber === sector.num && c.discovered);

            return (
              <div
                key={sector.num}
                id={`floorplan_sector_${sector.num}`}
                onClick={() => handleRoomClick(sector.num)}
                onMouseEnter={() => setHoveredSector(sector.num)}
                onMouseLeave={() => setHoveredSector(null)}
                style={{
                  position: "absolute",
                  left: `${sector.x}%`,
                  top: `${sector.y}%`,
                  width: `${sector.width}%`,
                  height: `${sector.height}%`,
                  zIndex: current ? 10 : 2,
                }}
                className={`rounded-lg transition-all duration-300 flex flex-col justify-between p-1.5 sm:p-2 cursor-pointer border ${
                  current
                    ? "bg-[#1f1910] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-1 ring-amber-400"
                    : cleared
                    ? "bg-[#0d1c15] border-emerald-500/60 hover:border-emerald-400 hover:bg-[#11261d]"
                    : "bg-[#0b0c10]/90 border-[#222838] opacity-50 hover:opacity-75"
                }`}
              >
                {/* Sector Header / Indicator */}
                <div className="flex items-center justify-between leading-none">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[8px] font-mono font-black uppercase px-1 py-0.5 rounded ${
                        current
                          ? "bg-amber-500 text-[#0a0b10]"
                          : cleared
                          ? "bg-emerald-500/30 text-emerald-300"
                          : "bg-[#181c28] text-[#6b7280]"
                      }`}
                    >
                      {sector.code}
                    </span>
                    {current && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {cleared ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : current ? (
                      <span className="text-[7px] font-mono font-bold text-amber-400 uppercase tracking-tighter">
                        ACTIVE
                      </span>
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-[#525a6f]" />
                    )}
                  </div>
                </div>

                {/* Sector Title & Type */}
                <div className="my-auto py-0.5">
                  <div
                    className={`text-[10px] sm:text-[11px] font-mono font-bold truncate ${
                      current
                        ? "text-amber-300 font-black"
                        : cleared
                        ? "text-emerald-100"
                        : "text-[#6b7280]"
                    }`}
                  >
                    {unlocked ? sector.shortName : `Sector 0${sector.num}`}
                  </div>
                  <div className="text-[8px] text-[#6b7280] font-mono truncate hidden sm:block">
                    {unlocked ? sector.type : "ACCESS RESTRICTED"}
                  </div>
                </div>

                {/* Sector Footer (Clue count / Status) */}
                <div className="flex items-center justify-between text-[7px] font-mono text-[#6b7280] pt-0.5 border-t border-[#1e2333]">
                  <span>RM-0{sector.num}</span>
                  {unlocked ? (
                    <span className="text-amber-400/90 font-bold">
                      {cluesInSector.length > 0 ? `🔎 ${cluesInSector.length} Clues` : "Cleared"}
                    </span>
                  ) : (
                    <span className="text-rose-400/80">LOCKED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Sector Tactical Inspector */}
      <div className="bg-[#11131a] p-3 border-t border-[#2d2d3d] text-xs font-mono">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-bold text-[10px]">
                {selectedSector.code}
              </span>
              <span className="text-white font-bold text-[11px] truncate">
                {selectedSector.name}
              </span>
            </div>
            <p className="text-[10px] text-[#9ca3af] leading-tight line-clamp-2">
              {isSectorUnlocked(selectedSector.num)
                ? selectedSector.desc
                : "Security lockdown active. Clear prior sector protocols to de-authorize blast locks."}
            </p>
          </div>

          <div className="shrink-0 text-right">
            {isSectorCurrent(selectedSector.num) ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold text-[9px]">
                <MapPin className="w-2.5 h-2.5" /> YOU ARE HERE
              </span>
            ) : isSectorCleared(selectedSector.num) ? (
              <button
                onClick={() => handleRoomClick(selectedSector.num)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900 font-bold text-[9px] transition"
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> RE-INSPECT
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1a1c25] border border-rose-500/30 text-rose-400 font-bold text-[9px]">
                <Lock className="w-2.5 h-2.5" /> SEALED
              </span>
            )}
          </div>
        </div>

        {/* Quick Room Jump Selector Buttons */}
        <div className="grid grid-cols-5 gap-1.5 mt-2.5 pt-2.5 border-t border-[#222838]">
          {SECTORS.map((s) => {
            const isUnlocked = isSectorUnlocked(s.num);
            const isCurrent = isSectorCurrent(s.num);
            const isCleared = isSectorCleared(s.num);

            return (
              <button
                key={s.num}
                onClick={() => handleRoomClick(s.num)}
                title={`Sector ${s.num}: ${s.name}`}
                className={`py-1 rounded text-center text-[10px] font-mono font-bold transition flex items-center justify-center gap-0.5 border ${
                  isCurrent
                    ? "bg-amber-500 text-[#0a0b10] border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                    : isCleared
                    ? "bg-[#112219] text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/50"
                    : "bg-[#0b0d13] text-[#4b5563] border-[#1e2333] cursor-not-allowed opacity-40"
                }`}
              >
                <span>R{s.num}</span>
                {isCleared && <span className="text-[8px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
