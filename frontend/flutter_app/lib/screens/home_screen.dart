import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_controller.dart';
import '../models/game_models.dart';
import '../theme/app_theme.dart';
import 'game_room_screen.dart';
import 'leaderboard_screen.dart';
import 'puzzles/bonus_vault_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _nameController = TextEditingController(text: 'Agent-Phoenix');
  Difficulty _selectedDifficulty = Difficulty.medium;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _onStartGame() {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter an Agent Codename!'),
          backgroundColor: AppTheme.neonRose,
        ),
      );
      return;
    }

    final controller = context.read<GameController>();
    controller.startGame(name, _selectedDifficulty);

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const GameRoomScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.lock_clock_outlined, color: AppTheme.neonAmber, size: 20),
            SizedBox(width: 8),
            Text('MISSION BRIEFING // SECTOR 7'),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Bonus Mini-Game Vault',
            icon: const Icon(Icons.flash_on, color: AppTheme.neonAmber),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const BonusVaultScreen()),
              );
            },
          ),
          IconButton(
            tooltip: 'Agent Leaderboard',
            icon: const Icon(Icons.emoji_events_outlined, color: AppTheme.neonAmber),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LeaderboardScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Story Briefing Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.cardSurface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.neonAmber.withOpacity(0.4)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.5),
                        blurRadius: 16,
                      ),
                    ],
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.warning_amber_rounded, color: AppTheme.neonAmber, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'FACILITY ALERT // CONTAINMENT LOCKDOWN',
                            style: TextStyle(
                              color: AppTheme.neonAmber,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              letterSpacing: 1.1,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 12),
                      Text(
                        'You are trapped inside the subterranean Artificial Intelligence Laboratory. The central neural core has initiated an emergency lockdown across 5 security sectors.\n\n'
                        'To override the doors and reach the surface, you must decrypt word scrambles, decapitated ciphers, dynamic AI riddles, optical rebus puzzles, and the final matchstick Fibonacci decontamination airlock before the countdown expires.',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Player Name Input
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '1. AGENT CODENAME',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _nameController,
                          maxLength: 24,
                          style: const TextStyle(
                            color: AppTheme.neonAmber,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.badge_outlined, color: AppTheme.neonAmber),
                            hintText: 'Enter your operative alias...',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Difficulty Selector
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '2. PROTOCOL DIFFICULTY',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            _buildDifficultyOption(
                              diff: Difficulty.easy,
                              title: '🟢 Easy',
                              subtitle: '20m • 5 Hints • 1.0×',
                              color: AppTheme.neonEmerald,
                            ),
                            const SizedBox(width: 10),
                            _buildDifficultyOption(
                              diff: Difficulty.medium,
                              title: '🟡 Medium',
                              subtitle: '15m • 3 Hints • 1.5×',
                              color: AppTheme.neonAmber,
                            ),
                            const SizedBox(width: 10),
                            _buildDifficultyOption(
                              diff: Difficulty.hard,
                              title: '🔴 Hard',
                              subtitle: '10m • 1 Hint • 2.0×',
                              color: AppTheme.neonRose,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 28),

                // Start Game Action
                ElevatedButton(
                  onPressed: _onStartGame,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.neonAmber,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.lock_open, size: 20),
                      SizedBox(width: 10),
                      Text(
                        'INITIATE ESCAPE RUN',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                const Center(
                  child: Text(
                    'SECURITY PROTOCOL ACTIVE // ALL DOORS ARMED',
                    style: TextStyle(
                      color: AppTheme.textDim,
                      fontSize: 10,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDifficultyOption({
    required Difficulty diff,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    final isSelected = _selectedDifficulty == diff;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedDifficulty = diff),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.15) : const Color(0xFF0D0F14),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? color : AppTheme.containerBorder,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Text(
                title,
                style: TextStyle(
                  color: isSelected ? color : Colors.white70,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppTheme.textDim,
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
