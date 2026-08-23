import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { HomeView } from "./components/HomeView";
import { LeaderboardView } from "./components/LeaderboardView";
import { BonusChamberModal } from "./components/BonusChamberModal";
import { SoundSettingsModal } from "./components/SoundSettingsModal";
import { VictoryModal } from "./components/VictoryModal";
import { Room1WordScramble } from "./components/Room1WordScramble";
import { Room2Decapitated } from "./components/Room2Decapitated";
import { Room3AIRiddle } from "./components/Room3AIRiddle";
import { Room4Rebus } from "./components/Room4Rebus";
import { Room5Matchstick } from "./components/Room5Matchstick";
import { ClueItem, DifficultyLevel, SoundSettings } from "./types";
import { isValidPlayerName, sanitizePlayerName } from "./utils/playerValidation";
import {
  playErrorBuzzer,
  getSoundSettings,
  subscribeSoundSettings,
  updateSoundSettings,
  initAudioContext,
} from "./utils/audio";
import { AlertTriangle, RotateCcw, Sparkles, HelpCircle, X, Loader2 } from "lucide-react";

export function App() {
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(1);
  const [unlockedRooms, setUnlockedRooms] = useState<number[]>([1]);
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(900); // 15 mins default
  const [initialTime, setInitialTime] = useState(900);
  const [maxHints, setMaxHints] = useState(3);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [discoveredClues, setDiscoveredClues] = useState<ClueItem[]>([]);
  const [completedBonusIds, setCompletedBonusIds] = useState<string[]>([]);
  
  // Sound Settings State Manager
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(getSoundSettings());
  const [showSoundSettingsModal, setShowSoundSettingsModal] = useState(false);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);

  // Synchronize with external sound settings updates & audio listeners
  useEffect(() => {
    const unsubscribe = subscribeSoundSettings((updated) => {
      setSoundSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  // Timer countdown loop
  useEffect(() => {
    if (!gameStarted || isVictory || isGameOver) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          playErrorBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isVictory, isGameOver]);

  const syncPlayerScore = async (
    name: string,
    currentScore: number,
    roomsCount: number,
    timeRem: number,
    diff: DifficultyLevel
  ) => {
    if (!isValidPlayerName(name)) return;
    const cleanName = sanitizePlayerName(name);
    const entry = {
      player: cleanName,
      score: currentScore,
      rooms_completed: roomsCount,
      time_remaining: timeRem,
      difficulty: diff,
      completed_at: new Date().toISOString(),
    };

    // 1. Save to local storage cache with 1 record per player constraint
    try {
      const raw = localStorage.getItem("ai_escape_room_user_scores");
      let list: any[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      const cleanList = list.filter((e: any) => e && isValidPlayerName(e.player));
      const idx = cleanList.findIndex((e: any) => e.player.toLowerCase() === cleanName.toLowerCase());
      if (idx >= 0) {
        if (
          currentScore > cleanList[idx].score ||
          (currentScore === cleanList[idx].score && roomsCount > cleanList[idx].rooms_completed) ||
          (currentScore === cleanList[idx].score && roomsCount === cleanList[idx].rooms_completed && timeRem >= cleanList[idx].time_remaining)
        ) {
          cleanList[idx] = entry;
        }
      } else {
        cleanList.push(entry);
      }
      localStorage.setItem("ai_escape_room_user_scores", JSON.stringify(cleanList));
    } catch {
      // safe fallback
    }

    // 2. Transmit to server API
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (e) {
      console.warn("Could not sync score to server:", e);
    }
  };

  const handleStartGame = (name: string, diff: DifficultyLevel) => {
    initAudioContext();
    const diffTimer = diff === "Easy" ? 1200 : diff === "Hard" ? 600 : 900;
    const diffHints = diff === "Easy" ? 5 : diff === "Hard" ? 1 : 3;
    const cleanName = sanitizePlayerName(name);

    setPlayerName(cleanName);
    setDifficulty(diff);
    setGameStarted(true);
    setCurrentRoom(1);
    setUnlockedRooms([1]);
    setScore(0);
    setInitialTime(diffTimer);
    setRemainingTime(diffTimer);
    setMaxHints(diffHints);
    setHintsRemaining(diffHints);
    setIsVictory(false);
    setIsGameOver(false);
    setDiscoveredClues([]);
    setCompletedBonusIds([]);
    setShowLeaderboard(false);
  };

  const handleUnlockRoom = (nextRoom: number, earnedPoints: number) => {
    const multiplier = difficulty === "Hard" ? 2.0 : difficulty === "Medium" ? 1.5 : 1.0;
    const adjustedPoints = Math.round(earnedPoints * multiplier);
    const newScore = score + adjustedPoints;
    const newRooms = unlockedRooms.includes(nextRoom) ? unlockedRooms : [...unlockedRooms, nextRoom];

    setScore(newScore);
    if (!unlockedRooms.includes(nextRoom)) {
      setUnlockedRooms(newRooms);
    }
    setCurrentRoom(nextRoom);

    // Sync live player progress
    syncPlayerScore(playerName, newScore, Math.max(1, nextRoom - 1), remainingTime, difficulty);
  };

  const handleFinalEscape = () => {
    setIsVictory(true);
  };

  const handleDiscoverClue = (newClue: ClueItem) => {
    setDiscoveredClues((prev) => {
      if (prev.some((c) => c.id === newClue.id)) return prev;
      return [...prev, newClue];
    });
  };

  const handleAwardBonusPoints = (bonusId: string, pts: number) => {
    if (completedBonusIds.includes(bonusId)) return;
    setCompletedBonusIds((prev) => [...prev, bonusId]);
    const multiplier = difficulty === "Hard" ? 2.0 : difficulty === "Medium" ? 1.5 : 1.0;
    const newScore = score + Math.round(pts * multiplier);
    setScore(newScore);
    syncPlayerScore(playerName, newScore, unlockedRooms.length, remainingTime, difficulty);
  };

  const [hintModalData, setHintModalData] = useState<{ room: number; text: string; loading: boolean } | null>(null);

  const handleRequestHint = async () => {
    if (hintsRemaining <= 0) return;
    setHintsRemaining((prev) => Math.max(0, prev - 1));
    setHintModalData({ room: currentRoom, text: "", loading: true });

    const roomDetails: Record<number, { title: string; detail: string }> = {
      1: { title: "Word Scramble", detail: "5 anagrams: PYTHON, COLLEGE, STUDENT, PROJECT, CODING. Passcode is first letters PCSPC." },
      2: { title: "Decapitated Cipher Archive", detail: "Missing boundary letters: CAT, PYTHON, ROBOT, LAPTOP, COMPILER. Master key is ESCAPE2026." },
      3: { title: "The Neural Riddle", detail: "Dynamic AI Riddle generated by Gemini based on technology and computer science concepts." },
      4: { title: "Visual Rebus Gallery", detail: "4 rebuses: Tricycle (4), Man Overboard (8), I Understand (2), Three Blind Mice (7). Safe code is 4827." },
      5: { title: "Matchstick & Fibonacci Blast Vault", detail: "6+4=4 balanced by moving 1 matchstick (e.g. 0+4=4, 5+4=9, 8-4=4) and sequence 2,3,5,8,13,[21]." },
    };

    const target = roomDetails[currentRoom] || { title: `Room ${currentRoom}`, detail: "Solve the security challenge." };

    try {
      const res = await fetch("/api/gemini/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: `Room ${currentRoom}`,
          puzzleTitle: target.title,
          puzzleDetail: target.detail,
        }),
      });
      const data = await res.json();
      setHintModalData({ room: currentRoom, text: data.hint || "Analyze the sequence patterns, initial letters, or structural clues!", loading: false });
    } catch (err) {
      setHintModalData({ room: currentRoom, text: "Focus on the first letters or mathematical rules in this sector.", loading: false });
    }
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setIsVictory(false);
    setIsGameOver(false);
    setCurrentRoom(1);
    setUnlockedRooms([1]);
    setScore(0);
    setRemainingTime(initialTime);
    setDiscoveredClues([]);
    setCompletedBonusIds([]);
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-[#e0e0e0] flex flex-col font-sans selection:bg-amber-500 selection:text-[#0a0b10]">
      {/* Top Navigation with Integrated Sound Settings Manager */}
      <Navbar
        playerName={playerName}
        score={score}
        remainingTime={remainingTime}
        currentRoom={currentRoom}
        difficulty={difficulty}
        gameStarted={gameStarted && !isVictory && !isGameOver}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenBonusModal={() => setShowBonusModal(true)}
        onResetGame={handleResetGame}
        soundSettings={soundSettings}
        onOpenSoundSettings={() => setShowSoundSettingsModal(true)}
        onUpdateSoundSettings={setSoundSettings}
      />

      {/* Main App Layout */}
      <main className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_center,_#161b22_0%,_#0a0b10_100%)]">
        {showLeaderboard ? (
          <LeaderboardView onBack={() => setShowLeaderboard(false)} />
        ) : !gameStarted ? (
          <HomeView
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
        ) : isGameOver ? (
          /* Game Over Screen */
          <div className="max-w-md mx-auto my-auto p-8 text-center space-y-6 bg-[#11131a] border border-[#2d2d3d] rounded-2xl shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600 text-white text-[10px] font-bold rounded uppercase tracking-widest">
              Lockdown Protocol Failure
            </div>
            <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-12 h-12 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Chamber Sealed</h2>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              The {Math.round(initialTime / 60)}-minute {difficulty.toUpperCase()} countdown expired before security override was authorized.
            </p>
            <div className="p-4 rounded-lg bg-[#0a0b10] border border-[#2d2d3d] text-xs">
              <span className="text-[#6b7280] uppercase tracking-widest text-[10px] block mb-1">Final Mission Score</span>
              <span className="font-mono text-xl font-bold text-amber-500">{score} PTS</span>
            </div>
            <button
              onClick={handleResetGame}
              className="w-full px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 mx-auto shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Escape Mission</span>
            </button>
          </div>
        ) : (
          /* Active Game View with Chamber Router */
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <Sidebar
              playerName={playerName}
              score={score}
              remainingTime={remainingTime}
              currentRoom={currentRoom}
              difficulty={difficulty}
              unlockedRooms={unlockedRooms}
              discoveredClues={discoveredClues}
              hintsRemaining={hintsRemaining}
              maxHints={maxHints}
              onRequestHint={handleRequestHint}
              onSelectRoom={(r) => setCurrentRoom(r)}
              onOpenBonusModal={() => setShowBonusModal(true)}
            />

            <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0 bg-[radial-gradient(circle_at_center,_#161b22_0%,_#0a0b10_100%)]">
              <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRoom}
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {currentRoom === 1 && (
                      <Room1WordScramble
                        onUnlockRoom={handleUnlockRoom}
                        onDiscoverClue={handleDiscoverClue}
                        discoveredClues={discoveredClues}
                      />
                    )}
                    {currentRoom === 2 && (
                      <Room2Decapitated
                        onUnlockRoom={handleUnlockRoom}
                        onDiscoverClue={handleDiscoverClue}
                        discoveredClues={discoveredClues}
                      />
                    )}
                    {currentRoom === 3 && (
                      <Room3AIRiddle
                        onUnlockRoom={handleUnlockRoom}
                        onDiscoverClue={handleDiscoverClue}
                        discoveredClues={discoveredClues}
                        difficulty={difficulty}
                      />
                    )}
                    {currentRoom === 4 && (
                      <Room4Rebus
                        onUnlockRoom={handleUnlockRoom}
                        onDiscoverClue={handleDiscoverClue}
                        discoveredClues={discoveredClues}
                      />
                    )}
                    {currentRoom === 5 && (
                      <Room5Matchstick
                        onFinalEscape={handleFinalEscape}
                        onDiscoverClue={handleDiscoverClue}
                        discoveredClues={discoveredClues}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* High Density Terminal Status Footer */}
      <footer className="h-11 bg-[#0d0f14] border-t border-[#2d2d3d] px-4 sm:px-6 flex flex-wrap items-center justify-between text-[10px] uppercase tracking-widest text-[#4b5563] font-mono select-none">
        <div className="flex items-center gap-2">
          <span>System Status: <span className="text-green-500 font-bold">Active</span></span>
          <span className="text-[#2d2d3d] hidden sm:inline">//</span>
          <span className="hidden sm:inline">Connection: <span className="text-green-500 font-bold">Secured</span></span>
          <span className="text-[#2d2d3d] hidden sm:inline">//</span>
          <span className="text-amber-500 font-bold">{difficulty.toUpperCase()} TIER</span>
          <span className="text-[#2d2d3d] hidden sm:inline">//</span>
          <button
            onClick={() => setShowSoundSettingsModal(true)}
            className="hover:text-amber-400 text-cyan-400/90 flex items-center gap-1 transition"
          >
            <span>Audio:</span>
            <span className="font-bold">
              {soundSettings.masterMuted
                ? "Muted"
                : soundSettings.bgmMuted
                ? "SFX Only"
                : "BGM + SFX"}
            </span>
          </button>
        </div>
        <div className="hidden md:block">
          Terminal Session: <span className="text-[#9ca3af]">{playerName ? `${playerName.toLowerCase().replace(/\s+/g, '-')}@ai-node` : "guest@ai-node-03"}</span>
        </div>
        <div>
          Build <span className="text-amber-500/80">v2.4.11-AUDIO</span>
        </div>
      </footer>

      {/* Sound Settings Control Node Modal */}
      <SoundSettingsModal
        isOpen={showSoundSettingsModal}
        onClose={() => setShowSoundSettingsModal(false)}
        soundSettings={soundSettings}
        onUpdateSettings={setSoundSettings}
      />

      {/* AI Tactical Hint Modal */}
      {hintModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#11131a] border border-[#2d2d3d] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono relative">
            <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Tactical Intelligence Clue</span>
              </div>
              <button
                id="close_hint_modal_btn"
                onClick={() => setHintModalData(null)}
                className="text-[#9ca3af] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#9ca3af]">
              Sector: <strong className="text-white">Room {hintModalData.room}</strong>
            </div>

            {hintModalData.loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-amber-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <span>Interrogating Gemini AI Core...</span>
              </div>
            ) : (
              <div className="p-4 rounded bg-[#0a0b10] border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed italic">
                &ldquo;{hintModalData.text}&rdquo;
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-[10px] text-[#6b7280]">
              <span>Hints Remaining: {hintsRemaining}/{maxHints}</span>
              <button
                onClick={() => setHintModalData(null)}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-[#0a0b10] font-black text-xs uppercase tracking-widest transition"
              >
                Acknowledge Clue
              </button>
            </div>
          </div>
        </div>
      )}

      {showBonusModal && (
        <BonusChamberModal
          onClose={() => setShowBonusModal(false)}
          onAwardBonusPoints={handleAwardBonusPoints}
          completedBonusIds={completedBonusIds}
        />
      )}

      {isVictory && (
        <VictoryModal
          playerName={playerName}
          baseScore={score}
          remainingTime={remainingTime}
          initialTime={initialTime}
          difficulty={difficulty}
          unlockedRoomsCount={unlockedRooms.length}
          onPlayAgain={handleResetGame}
          onViewLeaderboard={() => {
            setIsVictory(false);
            setGameStarted(false);
            setShowLeaderboard(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
