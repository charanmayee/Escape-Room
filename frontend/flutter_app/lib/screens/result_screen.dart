import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_controller.dart';
import '../models/game_models.dart';
import '../theme/app_theme.dart';
import 'leaderboard_screen.dart';

class ResultScreen extends StatelessWidget {
  const ResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();
    final isVictory = controller.isVictory;

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 580),
            child: Card(
              color: AppTheme.cardSurface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: isVictory ? AppTheme.neonEmerald : AppTheme.neonRose,
                  width: 2,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Result Header Icon
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: (isVictory ? AppTheme.neonEmerald : AppTheme.neonRose).withOpacity(0.15),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isVictory ? AppTheme.neonEmerald : AppTheme.neonRose,
                          width: 2,
                        ),
                      ),
                      child: Icon(
                        isVictory ? Icons.emoji_events : Icons.lock,
                        size: 40,
                        color: isVictory ? AppTheme.neonEmerald : AppTheme.neonRose,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Title
                    Text(
                      isVictory ? 'FACILITY BREACH SUCCESSFUL' : 'CONTAINMENT LOCKDOWN FAILED',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: isVictory ? AppTheme.neonEmerald : AppTheme.neonRose,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 8),

                    Text(
                      isVictory
                          ? 'Agent ${controller.playerName} has escaped all 5 security sectors!'
                          : 'Emergency lockdown engaged permanently. Operative neutralized.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    ),

                    const SizedBox(height: 24),
                    const Divider(color: AppTheme.containerBorder),
                    const SizedBox(height: 16),

                    // Mission Statistics Grid
                    _buildStatRow('Agent Operative:', controller.playerName),
                    _buildStatRow('Difficulty Tier:', '${controller.difficulty.label.toUpperCase()} (${controller.difficulty.scoreMultiplier}×)'),
                    _buildStatRow('Sectors Cleared:', '${controller.unlockedRooms.length} / 5'),
                    _buildStatRow('Time Remaining:', '${controller.remainingTime ~/ 60}m ${controller.remainingTime % 60}s'),
                    _buildStatRow('Clues Discovered:', '${controller.discoveredClues.length} items'),

                    const SizedBox(height: 16),
                    const Divider(color: AppTheme.containerBorder),
                    const SizedBox(height: 16),

                    // Total XP Score Highlight
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D0F14),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.neonAmber.withOpacity(0.5)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'FINAL ESCAPE SCORE',
                            style: TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              letterSpacing: 1.1,
                            ),
                          ),
                          Text(
                            '${controller.score} XP',
                            style: const TextStyle(
                              color: AppTheme.neonAmber,
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.emoji_events_outlined, size: 18),
                            label: const Text('LEADERBOARD'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.neonAmber,
                              side: const BorderSide(color: AppTheme.neonAmber),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const LeaderboardScreen()),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.replay, size: 18),
                            label: const Text('PLAY AGAIN'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isVictory ? AppTheme.neonEmerald : AppTheme.neonAmber,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            onPressed: () {
                              controller.resetGame();
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textDim, fontSize: 13)),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }
}
