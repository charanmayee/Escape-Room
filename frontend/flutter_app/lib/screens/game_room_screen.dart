import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_controller.dart';
import '../models/game_models.dart';
import '../theme/app_theme.dart';
import '../widgets/game_app_bar.dart';
import 'puzzles/word_scramble_screen.dart';
import 'puzzles/decapitated_words_screen.dart';
import 'puzzles/ai_riddle_screen.dart';
import 'puzzles/rebus_puzzle_screen.dart';
import 'puzzles/matchstick_puzzle_screen.dart';
import 'result_screen.dart';
import 'home_screen.dart';

class GameRoomScreen extends StatelessWidget {
  const GameRoomScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();

    if (!controller.gameStarted) {
      return const HomeScreen();
    }

    if (controller.isVictory || controller.isGameOver) {
      return const ResultScreen();
    }

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: const GameAppBar(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 860),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Chamber Selector / Facility Map Pills
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.cardSurface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.containerBorder),
                  ),
                  child: Row(
                    children: List.generate(5, (index) {
                      final roomNum = index + 1;
                      final isCurrent = controller.currentRoom == roomNum;
                      final isUnlocked = controller.unlockedRooms.contains(roomNum);

                      return Expanded(
                        child: GestureDetector(
                          onTap: isUnlocked ? () => controller.switchRoom(roomNum) : null,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: isCurrent
                                  ? AppTheme.neonAmber
                                  : isUnlocked
                                      ? const Color(0xFF1A1D27)
                                      : const Color(0xFF0D0F14),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: isCurrent
                                    ? AppTheme.neonAmber
                                    : isUnlocked
                                        ? AppTheme.containerBorder
                                        : Colors.transparent,
                              ),
                            ),
                            child: Column(
                              children: [
                                Icon(
                                  isCurrent
                                      ? Icons.lock_open
                                      : isUnlocked
                                          ? Icons.check_circle_outline
                                          : Icons.lock_outline,
                                  size: 14,
                                  color: isCurrent
                                      ? const Color(0xFF0A0B10)
                                      : isUnlocked
                                          ? AppTheme.neonEmerald
                                          : AppTheme.textDim,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'ROOM $roomNum',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: isCurrent
                                        ? const Color(0xFF0A0B10)
                                        : isUnlocked
                                            ? Colors.white70
                                            : AppTheme.textDim,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),

                const SizedBox(height: 16),

                // Active Chamber Puzzle Body
                _renderCurrentRoom(controller.currentRoom),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _renderCurrentRoom(int room) {
    switch (room) {
      case 1:
        return const WordScrambleScreen();
      case 2:
        return const DecapitatedWordsScreen();
      case 3:
        return const AiRiddleScreen();
      case 4:
        return const RebusPuzzleScreen();
      case 5:
        return const MatchstickPuzzleScreen();
      default:
        return const WordScrambleScreen();
    }
  }
}
