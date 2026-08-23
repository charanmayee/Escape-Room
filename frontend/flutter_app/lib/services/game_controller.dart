import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/game_models.dart';
import 'api_service.dart';

class GameController extends ChangeNotifier {
  String playerName = '';
  Difficulty difficulty = Difficulty.medium;
  bool gameStarted = false;

  int currentRoom = 1;
  List<int> unlockedRooms = [1];
  int score = 0;
  int remainingTime = 900;
  int initialTime = 900;
  int lives = 3;
  int maxLives = 3;
  int hintsRemaining = 3;

  bool isVictory = false;
  bool isGameOver = false;
  List<ClueItem> discoveredClues = [];

  Timer? _timer;

  void startGame(String name, Difficulty diff) {
    playerName = name.trim().isEmpty ? 'Agent-01' : name.trim();
    difficulty = diff;
    gameStarted = true;

    currentRoom = 1;
    unlockedRooms = [1];
    score = 0;
    initialTime = diff.timerSeconds;
    remainingTime = diff.timerSeconds;
    hintsRemaining = diff.startingHints;
    lives = diff.startingLives;
    maxLives = diff.startingLives;

    isVictory = false;
    isGameOver = false;
    discoveredClues = [];

    _startCountdown();
    notifyListeners();
  }

  void _startCountdown() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (remainingTime > 0 && !isVictory && !isGameOver) {
        remainingTime--;
        notifyListeners();
      } else if (remainingTime <= 0) {
        t.cancel();
        isGameOver = true;
        notifyListeners();
      }
    });
  }

  void switchRoom(int room) {
    if (unlockedRooms.contains(room)) {
      currentRoom = room;
      notifyListeners();
    }
  }

  void unlockNextRoom(int nextRoom, int basePoints) {
    final pts = (basePoints * difficulty.scoreMultiplier).round();
    score += pts;
    if (!unlockedRooms.contains(nextRoom)) {
      unlockedRooms.add(nextRoom);
    }
    currentRoom = nextRoom;
    notifyListeners();
  }

  void recordWrongAttempt() {
    if (lives > 1) {
      lives--;
    } else {
      lives = 0;
      isGameOver = true;
      _timer?.cancel();
    }
    // Time penalty of 15 seconds for incorrect override attempt
    remainingTime = remainingTime > 15 ? remainingTime - 15 : 0;
    notifyListeners();
  }

  void awardBonusPoints(int pts) {
    score += (pts * difficulty.scoreMultiplier).round();
    notifyListeners();
  }

  void discoverClue(ClueItem clue) {
    if (!discoveredClues.any((c) => c.id == clue.id)) {
      discoveredClues.add(clue);
      score += 25; // Exploration XP reward
      notifyListeners();
    }
  }

  bool useHint() {
    if (hintsRemaining > 0) {
      hintsRemaining--;
      // Small penalty on remaining time
      remainingTime = remainingTime > 10 ? remainingTime - 10 : 0;
      notifyListeners();
      return true;
    }
    return false;
  }

  void triggerVictory() {
    isVictory = true;
    _timer?.cancel();

    // Final time bonus
    final timeBonus = (remainingTime * 2 * difficulty.scoreMultiplier).round();
    score += timeBonus;

    // Submit to server leaderboard
    ApiService.submitScore(
      player: playerName,
      score: score,
      roomsCompleted: 5,
      timeRemaining: remainingTime,
      difficulty: difficulty.label,
    );

    notifyListeners();
  }

  void resetGame() {
    _timer?.cancel();
    gameStarted = false;
    isVictory = false;
    isGameOver = false;
    currentRoom = 1;
    unlockedRooms = [1];
    score = 0;
    discoveredClues = [];
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
