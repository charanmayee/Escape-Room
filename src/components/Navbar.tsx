import React from "react";
import {
  Lock,
  Volume2,
  VolumeX,
  Volume1,
  Music,
  Sliders,
  Trophy,
  Flame,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { SoundSettings, DifficultyLevel } from "../types";
import {
  isSoundEnabled,
  isBgmEnabled,
  toggleMasterSound,
  toggleBgm,
  playKeyClickSound,
  initAudioContext,
} from "../utils/audio";

interface NavbarProps {
  playerName: string;
  score: number;
  remainingTime: number;
  currentRoom: number;
  difficulty: DifficultyLevel;
  gameStarted: boolean;
  onOpenLeaderboard: () => void;
  onOpenBonusModal: () => void;
  onResetGame: () => void;
  soundSettings: SoundSettings;
  onOpenSoundSettings: () => void;
  onUpdateSoundSettings: (settings: SoundSettings) => void;
  // Deprecated compatibility props
  soundOn?: boolean;
  setSoundOn?: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  playerName,
  score,
  remainingTime,
  currentRoom,
  difficulty,
  gameStarted,
  onOpenLeaderboard,
  onOpenBonusModal,
  onResetGame,
  soundSettings,
  onOpenSoundSettings,
  onUpdateSoundSettings,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isMasterActive = !soundSettings.masterMuted;
  const isBgmActive = isMasterActive && !soundSettings.bgmMuted;
  const isSfxActive = isMasterActive && !soundSettings.sfxMuted;

  const handleQuickToggleBgm = (e: React.MouseEvent) => {
    e.stopPropagation();
    initAudioContext();
    const active = toggleBgm();
    onUpdateSoundSettings({ ...soundSettings, bgmMuted: !active });
    if (active) playKeyClickSound();
  };

  const getDiffBadge = () => {
    switch (difficulty) {
      case "Easy":
        return {
          icon: ShieldCheck,
          text: "EASY // 1.0×",
          cls: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
        };
      case "Hard":
        return {
          icon: AlertTriangle,
          text: "HARD // 2.0×",
          cls: "text-rose-400 border-rose-500/40 bg-rose-950/40",
        };
      default:
        return {
          icon: Flame,
          text: "MEDIUM // 1.5×",
          cls: "text-amber-400 border-amber-500/40 bg-amber-950/40",
        };
    }
  };

  const diffBadge = getDiffBadge();
  const DiffIcon = diffBadge.icon;

  return (
    <header id="app_header" className="sticky top-0 z-40 bg-[#11131a] border-b border-[#2d2d3d] px-4 sm:px-6 py-2.5 text-[#e0e0e0] font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <span className="text-[#0a0b10] font-black text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <span>Escape Room</span>
              <span className="text-amber-500">Control</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-widest text-[#6b7280] hidden sm:block">
                Breach Node // Active
              </p>
              {gameStarted && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase ${diffBadge.cls}`}>
                  <DiffIcon className="w-2.5 h-2.5" />
                  {diffBadge.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Live Mission Duration & Score Display */}
        {gameStarted ? (
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#6b7280]">Mission Duration</span>
              <span className="text-xl sm:text-2xl text-amber-500 font-bold">
                {formatTime(remainingTime)}
              </span>
            </div>

            <div className="h-9 w-[1px] bg-[#2d2d3d] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-[#6b7280]">Current Score</p>
                <p className="text-lg font-bold text-white">{score.toLocaleString()}</p>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-amber-500/30 flex items-center justify-center bg-[#1a1c25] shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                <span className="text-amber-500 font-black text-xs">XP</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#1a1c25] border border-[#2d2d3d] text-[10px] uppercase tracking-widest text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>Ready for Ingress</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {gameStarted && (
            <button
              id="bonus_mini_games_btn"
              onClick={onOpenBonusModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1c25] border border-amber-500/40 text-amber-400 hover:bg-[#222533] hover:text-amber-300 transition text-[11px] font-bold uppercase tracking-wider"
              title="Open Sudoku, Chroma & Spot Difference"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Bonus</span>
            </button>
          )}

          <button
            id="open_leaderboard_nav_btn"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] text-[#9ca3af] hover:text-white hover:border-amber-500/30 transition text-[11px] font-semibold uppercase tracking-wider"
            title="Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Ranks</span>
          </button>

          {/* Background Audio Quick Toggle */}
          <button
            id="toggle_bgm_quick_btn"
            onClick={handleQuickToggleBgm}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition border ${
              isBgmActive
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60"
                : "bg-[#1a1c25] border-[#2d2d3d] text-[#6b7280] hover:text-[#9ca3af]"
            }`}
            title={isBgmActive ? "Pause Background Atmosphere" : "Resume Background Atmosphere"}
          >
            <Music className={`w-3.5 h-3.5 ${isBgmActive ? "text-cyan-400 animate-pulse" : "text-[#6b7280]"}`} />
          </button>

          {/* Sound Settings Button */}
          <button
            id="toggle_sound_settings_btn"
            onClick={() => {
              initAudioContext();
              onOpenSoundSettings();
            }}
            className={`relative p-2 rounded-lg bg-[#1a1c25] border transition flex items-center justify-center ${
              isMasterActive
                ? "border-amber-500/40 text-amber-400 hover:border-amber-400"
                : "border-rose-900/40 text-rose-400 hover:border-rose-700"
            }`}
            title="Audio Settings"
          >
            {isMasterActive ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>

          {gameStarted && (
            <button
              id="abandon_run_nav_btn"
              onClick={onResetGame}
              className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 transition"
              title="Abandon & Reset Mission"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
