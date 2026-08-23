import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Volume1,
  Music,
  Sliders,
  Sparkles,
  Check,
  X,
  Radio,
  Play,
  RotateCcw
} from "lucide-react";
import { SoundSettings } from "../types";
import {
  updateSoundSettings,
  playKeyClickSound,
  playSuccessChime,
  playDoorUnlockSound,
  initAudioContext
} from "../utils/audio";

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundSettings: SoundSettings;
  onUpdateSettings: (settings: SoundSettings) => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  soundSettings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleToggleMaster = () => {
    initAudioContext();
    const updated = updateSoundSettings({ masterMuted: !soundSettings.masterMuted });
    onUpdateSettings(updated);
    if (!updated.masterMuted) playKeyClickSound();
  };

  const handleToggleBgm = () => {
    initAudioContext();
    const updated = updateSoundSettings({ bgmMuted: !soundSettings.bgmMuted });
    onUpdateSettings(updated);
    if (!updated.bgmMuted) playKeyClickSound();
  };

  const handleToggleSfx = () => {
    initAudioContext();
    const updated = updateSoundSettings({ sfxMuted: !soundSettings.sfxMuted });
    onUpdateSettings(updated);
    if (!updated.sfxMuted) playKeyClickSound();
  };

  const handleMasterVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updated = updateSoundSettings({ masterVolume: val, masterMuted: false });
    onUpdateSettings(updated);
  };

  const handleBgmVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    initAudioContext();
    const val = parseFloat(e.target.value);
    const updated = updateSoundSettings({ bgmVolume: val, bgmMuted: false });
    onUpdateSettings(updated);
  };

  const handleSfxVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updated = updateSoundSettings({ sfxVolume: val, sfxMuted: false });
    onUpdateSettings(updated);
  };

  const handleApplyPreset = (preset: "immersion" | "sfxOnly" | "quiet" | "muted") => {
    initAudioContext();
    let patch: Partial<SoundSettings> = {};
    if (preset === "immersion") {
      patch = { masterMuted: false, bgmMuted: false, sfxMuted: false, masterVolume: 0.85, bgmVolume: 0.5, sfxVolume: 0.85 };
    } else if (preset === "sfxOnly") {
      patch = { masterMuted: false, bgmMuted: true, sfxMuted: false, masterVolume: 0.8, sfxVolume: 0.85 };
    } else if (preset === "quiet") {
      patch = { masterMuted: false, bgmMuted: false, sfxMuted: false, masterVolume: 0.35, bgmVolume: 0.25, sfxVolume: 0.4 };
    } else if (preset === "muted") {
      patch = { masterMuted: true };
    }
    const updated = updateSoundSettings(patch);
    onUpdateSettings(updated);
    playKeyClickSound();
  };

  const isMasterActive = !soundSettings.masterMuted;
  const isBgmActive = isMasterActive && !soundSettings.bgmMuted;
  const isSfxActive = isMasterActive && !soundSettings.sfxMuted;

  return (
    <div
      id="sound_settings_backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="sound_settings_panel"
        className="bg-[#11131a] border border-[#2d2d3d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white relative font-mono select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight uppercase text-white flex items-center gap-2">
                <span>Audio Control Node</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Realtime Synth
                </span>
              </h2>
              <p className="text-[10px] text-[#6b7280] uppercase tracking-wider">
                Procedural Atmosphere & Sound FX
              </p>
            </div>
          </div>
          <button
            id="close_sound_modal_btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#1a1c25] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Sound Card */}
        <div className="p-3.5 rounded-xl bg-[#161822] border border-[#2d2d3d] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isMasterActive ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"}`}>
                {isMasterActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white">Master Audio</div>
                <div className="text-[10px] text-[#6b7280]">
                  {isMasterActive ? `${Math.round(soundSettings.masterVolume * 100)}% Output` : "Muted"}
                </div>
              </div>
            </div>

            <button
              id="toggle_master_audio_btn"
              onClick={handleToggleMaster}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                isMasterActive
                  ? "bg-amber-500 text-[#0a0b10] hover:bg-amber-400"
                  : "bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900"
              }`}
            >
              {isMasterActive ? "Active" : "Muted"}
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-[#6b7280] w-6">0%</span>
            <input
              id="master_volume_slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundSettings.masterVolume}
              onChange={handleMasterVolume}
              disabled={!isMasterActive}
              className="flex-1 h-1.5 bg-[#2d2d3d] rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30"
            />
            <span className="text-[10px] text-amber-400 font-bold w-9 text-right font-mono">
              {Math.round(soundSettings.masterVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Ambient Background Music Controller */}
        <div className="p-3.5 rounded-xl bg-[#161822] border border-[#2d2d3d] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isBgmActive ? "bg-cyan-500/20 text-cyan-400" : "bg-[#222533] text-[#6b7280]"}`}>
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>Background Atmosphere</span>
                  {isBgmActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#6b7280]">
                  Procedural Cyber Synth Drone
                </div>
              </div>
            </div>

            <button
              id="toggle_bgm_audio_btn"
              onClick={handleToggleBgm}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                isBgmActive
                  ? "bg-cyan-500 text-[#0a0b10] hover:bg-cyan-400"
                  : "bg-[#222533] border border-[#2d2d3d] text-[#9ca3af] hover:text-white"
              }`}
            >
              {isBgmActive ? "Playing" : "Paused"}
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-[#6b7280] w-6">0%</span>
            <input
              id="bgm_volume_slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundSettings.bgmVolume}
              onChange={handleBgmVolume}
              disabled={!isBgmActive}
              className="flex-1 h-1.5 bg-[#2d2d3d] rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-30"
            />
            <span className="text-[10px] text-cyan-400 font-bold w-9 text-right font-mono">
              {Math.round(soundSettings.bgmVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Sound FX Controller */}
        <div className="p-3.5 rounded-xl bg-[#161822] border border-[#2d2d3d] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isSfxActive ? "bg-amber-500/20 text-amber-400" : "bg-[#222533] text-[#6b7280]"}`}>
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white">Sound Effects (SFX)</div>
                <div className="text-[10px] text-[#6b7280]">Chamber doors, clicks & chimes</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="test_sfx_btn"
                onClick={() => {
                  initAudioContext();
                  playSuccessChime();
                }}
                disabled={!isSfxActive}
                className="px-2 py-1 rounded bg-[#222533] hover:bg-[#2d3142] text-[10px] text-amber-400 disabled:opacity-40 transition border border-amber-500/30 flex items-center gap-1"
                title="Play test audio chime"
              >
                <Play className="w-2.5 h-2.5 fill-amber-400" />
                <span>Test</span>
              </button>

              <button
                id="toggle_sfx_audio_btn"
                onClick={handleToggleSfx}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                  isSfxActive
                    ? "bg-amber-500 text-[#0a0b10] hover:bg-amber-400"
                    : "bg-[#222533] border border-[#2d2d3d] text-[#9ca3af] hover:text-white"
                }`}
              >
                {isSfxActive ? "Active" : "Muted"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-[#6b7280] w-6">0%</span>
            <input
              id="sfx_volume_slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundSettings.sfxVolume}
              onChange={handleSfxVolume}
              disabled={!isSfxActive}
              className="flex-1 h-1.5 bg-[#2d2d3d] rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30"
            />
            <span className="text-[10px] text-amber-400 font-bold w-9 text-right font-mono">
              {Math.round(soundSettings.sfxVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] uppercase tracking-widest text-[#6b7280]">Audio Presets</div>
          <div className="grid grid-cols-4 gap-2 text-[10px] font-bold uppercase">
            <button
              onClick={() => handleApplyPreset("immersion")}
              className="px-2 py-2 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] hover:border-amber-500/50 hover:text-amber-400 transition text-center"
            >
              Full Sound
            </button>
            <button
              onClick={() => handleApplyPreset("sfxOnly")}
              className="px-2 py-2 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] hover:border-amber-500/50 hover:text-amber-400 transition text-center"
            >
              SFX Only
            </button>
            <button
              onClick={() => handleApplyPreset("quiet")}
              className="px-2 py-2 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] hover:border-amber-500/50 hover:text-amber-400 transition text-center"
            >
              Subtle
            </button>
            <button
              onClick={() => handleApplyPreset("muted")}
              className="px-2 py-2 rounded-lg bg-[#1a1c25] border border-[#2d2d3d] hover:border-rose-500/50 hover:text-rose-400 transition text-center"
            >
              Mute All
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#2d2d3d] flex justify-between items-center">
          <span className="text-[10px] text-[#6b7280]">100% Web Audio Synthesized</span>
          <button
            id="done_sound_settings_btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-widest transition"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
};
