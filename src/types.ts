export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface LeaderboardEntry {
  player: string;
  score: number;
  rooms_completed: number;
  time_remaining: number;
  completed_at: string;
  difficulty?: DifficultyLevel;
}

export interface ClueItem {
  id: string;
  roomNumber: number;
  name: string;
  icon: string;
  text: string;
  discovered: boolean;
}

export interface RiddleData {
  question: string;
  answer: string;
  hint: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  theme: string;
}

export interface PythonFile {
  path: string;
  content: string;
}

export interface SoundSettings {
  masterMuted: boolean;
  sfxMuted: boolean;
  bgmMuted: boolean;
  masterVolume: number; // 0.0 to 1.0
  sfxVolume: number;    // 0.0 to 1.0
  bgmVolume: number;    // 0.0 to 1.0
}
