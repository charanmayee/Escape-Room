import { SoundSettings } from "../types";

/**
 * Web Audio API synthesizer for escape room sound effects & ambient background music.
 * 100% self-contained, procedural generative audio with zero external dependencies.
 */

const STORAGE_KEY = "ai_escape_room_sound_settings_v1";

const DEFAULT_SETTINGS: SoundSettings = {
  masterMuted: false,
  sfxMuted: false,
  bgmMuted: false,
  masterVolume: 0.8,
  sfxVolume: 0.8,
  bgmVolume: 0.45,
};

let currentSettings: SoundSettings = loadStoredSettings();
let audioCtx: AudioContext | null = null;
let bgmGainNode: GainNode | null = null;
let bgmFilterNode: BiquadFilterNode | null = null;
let bgmOscillators: OscillatorNode[] = [];
let bgmIntervalId: any = null;
let bgmInitialized = false;

const listeners = new Set<(settings: SoundSettings) => void>();

function loadStoredSettings(): SoundSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        masterMuted: Boolean(parsed.masterMuted),
        sfxMuted: Boolean(parsed.sfxMuted),
        bgmMuted: Boolean(parsed.bgmMuted),
        masterVolume: typeof parsed.masterVolume === "number" ? Math.max(0, Math.min(1, parsed.masterVolume)) : DEFAULT_SETTINGS.masterVolume,
        sfxVolume: typeof parsed.sfxVolume === "number" ? Math.max(0, Math.min(1, parsed.sfxVolume)) : DEFAULT_SETTINGS.sfxVolume,
        bgmVolume: typeof parsed.bgmVolume === "number" ? Math.max(0, Math.min(1, parsed.bgmVolume)) : DEFAULT_SETTINGS.bgmVolume,
      };
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: SoundSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export function getSoundSettings(): SoundSettings {
  return { ...currentSettings };
}

export function subscribeSoundSettings(listener: (settings: SoundSettings) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn({ ...currentSettings });
    } catch (e) {}
  });
}

export function updateSoundSettings(patch: Partial<SoundSettings>): SoundSettings {
  currentSettings = {
    ...currentSettings,
    ...patch,
  };
  saveSettings(currentSettings);
  updateBgmVolume();
  notifyListeners();
  return { ...currentSettings };
}

export function toggleMasterSound(): boolean {
  const next = !currentSettings.masterMuted;
  updateSoundSettings({ masterMuted: next });
  if (!next) {
    initAudioContext();
  }
  return !next;
}

export function toggleBgm(): boolean {
  const next = !currentSettings.bgmMuted;
  updateSoundSettings({ bgmMuted: next });
  if (!next) {
    initAudioContext();
  }
  return !next;
}

export function toggleSfx(): boolean {
  const next = !currentSettings.sfxMuted;
  updateSoundSettings({ sfxMuted: next });
  return !next;
}

// Backwards-compatible sound enable helper
export function setSoundEnabled(enabled: boolean) {
  updateSoundSettings({ masterMuted: !enabled, sfxMuted: !enabled });
}

export function isSoundEnabled(): boolean {
  return !currentSettings.masterMuted && !currentSettings.sfxMuted;
}

export function isBgmEnabled(): boolean {
  return !currentSettings.masterMuted && !currentSettings.bgmMuted;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function initAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  if (!bgmInitialized && isBgmEnabled()) {
    startBackgroundMusic();
  }
}

// Setup user interaction trigger for browser autoplay compliance
if (typeof window !== "undefined") {
  const resumeOnInteraction = () => {
    initAudioContext();
    window.removeEventListener("click", resumeOnInteraction);
    window.removeEventListener("keydown", resumeOnInteraction);
    window.removeEventListener("touchstart", resumeOnInteraction);
  };
  window.addEventListener("click", resumeOnInteraction, { once: true });
  window.addEventListener("keydown", resumeOnInteraction, { once: true });
  window.addEventListener("touchstart", resumeOnInteraction, { once: true });
}

function getEffectiveSfxGain(baseGain: number): number {
  if (currentSettings.masterMuted || currentSettings.sfxMuted) return 0;
  return baseGain * currentSettings.masterVolume * currentSettings.sfxVolume;
}

function getEffectiveBgmGain(): number {
  if (currentSettings.masterMuted || currentSettings.bgmMuted) return 0;
  // Scaled down to create a comfortable atmospheric backing layer (0 - 0.15 master)
  return currentSettings.masterVolume * currentSettings.bgmVolume * 0.14;
}

function updateBgmVolume() {
  if (!bgmGainNode || !audioCtx) return;
  try {
    const target = getEffectiveBgmGain();
    const now = audioCtx.currentTime;
    bgmGainNode.gain.cancelScheduledValues(now);
    bgmGainNode.gain.setTargetAtTime(target, now, 0.15);

    if (target > 0 && !bgmInitialized) {
      startBackgroundMusic();
    }
  } catch (e) {}
}

/**
 * Procedural Escape Room Ambient Soundtrack Synthesizer
 * Generates an evolving cyberpunk / sci-fi mystery drone with soft periodic shimmer tones.
 */
export function startBackgroundMusic() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (bgmInitialized) {
    updateBgmVolume();
    return;
  }

  try {
    bgmInitialized = true;
    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    const targetGain = getEffectiveBgmGain();
    bgmGainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.3);

    // Warm resonant low-pass filter
    bgmFilterNode = ctx.createBiquadFilter();
    bgmFilterNode.type = "lowpass";
    bgmFilterNode.frequency.setValueAtTime(320, ctx.currentTime);
    bgmFilterNode.Q.setValueAtTime(2.5, ctx.currentTime);

    bgmFilterNode.connect(bgmGainNode);
    bgmGainNode.connect(ctx.destination);

    // LFO to slowly sweep filter frequency (atmospheric breath effect)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second cycle
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bgmFilterNode.frequency);
    lfo.start();
    bgmOscillators.push(lfo);

    // Root drone chords (D2, A2, F3)
    const droneFreqs = [73.42, 110.0, 174.61];
    droneFreqs.forEach((freq, idx) => {
      if (!ctx || !bgmFilterNode) return;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slight detune for analog warmth
      osc.detune.setValueAtTime((idx - 1) * 6, ctx.currentTime);

      oscGain.gain.setValueAtTime(0.18 / (idx + 1), ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(bgmFilterNode);
      osc.start();
      bgmOscillators.push(osc);
    });

    // Gentle periodic ambient shimmer notes (Pentatonic mystery scale: D4, F4, G4, A4, C5, D5)
    const shimmerNotes = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33];
    let noteIndex = 0;

    const playShimmerPulse = () => {
      if (!ctx || !bgmGainNode || getEffectiveBgmGain() <= 0.0001) return;
      try {
        const now = ctx.currentTime;
        const noteFreq = shimmerNotes[noteIndex % shimmerNotes.length];
        noteIndex = (noteIndex + 1 + Math.floor(Math.random() * 2)) % shimmerNotes.length;

        const pulseOsc = ctx.createOscillator();
        const pulseGain = ctx.createGain();

        pulseOsc.type = "sine";
        pulseOsc.frequency.setValueAtTime(noteFreq, now);

        pulseGain.gain.setValueAtTime(0.0001, now);
        pulseGain.gain.setTargetAtTime(0.04, now, 0.1);
        pulseGain.gain.setTargetAtTime(0.0001, now + 0.4, 0.7);

        pulseOsc.connect(pulseGain);
        pulseGain.connect(bgmGainNode);

        pulseOsc.start(now);
        pulseOsc.stop(now + 3.2);
      } catch (e) {}
    };

    // Trigger shimmer tone every 3.8 to 5.2 seconds
    bgmIntervalId = setInterval(playShimmerPulse, 4200);
  } catch (e) {
    bgmInitialized = false;
  }
}

export function stopBackgroundMusic() {
  if (bgmIntervalId) {
    clearInterval(bgmIntervalId);
    bgmIntervalId = null;
  }
  bgmOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {}
  });
  bgmOscillators = [];

  if (bgmGainNode) {
    try {
      bgmGainNode.disconnect();
    } catch (e) {}
    bgmGainNode = null;
  }
  if (bgmFilterNode) {
    try {
      bgmFilterNode.disconnect();
    } catch (e) {}
    bgmFilterNode = null;
  }
  bgmInitialized = false;
}

// -------------------------------------------------------------
// Interactive Sound FX (Scalable with Master & SFX Volume)
// -------------------------------------------------------------

export function playKeyClickSound() {
  const effGain = getEffectiveSfxGain(0.12);
  if (effGain <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(effGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

export function playSuccessChime() {
  const effGain = getEffectiveSfxGain(0.15);
  if (effGain <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(effGain, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } catch (e) {}
}

export function playDoorUnlockSound() {
  const effGain = getEffectiveSfxGain(0.18);
  if (effGain <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Heavy mechanical servo slide
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.3);
    gain.gain.setValueAtTime(effGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

    // High tech beep confirmation
    setTimeout(() => {
      if (!ctx) return;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      gain2.gain.setValueAtTime(effGain * 1.1, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.25);
    }, 320);
  } catch (e) {}
}

export function playErrorBuzzer() {
  const effGain = getEffectiveSfxGain(0.2);
  if (effGain <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.1);
    gain.gain.setValueAtTime(effGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}

export function playClueFoundSound() {
  const effGain = getEffectiveSfxGain(0.14);
  if (effGain <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    gain.gain.setValueAtTime(effGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}
