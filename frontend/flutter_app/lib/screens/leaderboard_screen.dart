import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/game_models.dart';
import '../theme/app_theme.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  late Future<List<LeaderboardEntry>> _leaderboardFuture;

  @override
  void initState() {
    super.initState();
    _leaderboardFuture = ApiService.fetchLeaderboard();
  }

  void _refresh() {
    setState(() {
      _leaderboardFuture = ApiService.fetchLeaderboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('GLOBAL OPERATIVE LEADERBOARD'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Rankings',
            onPressed: _refresh,
          ),
        ],
      ),
      body: FutureBuilder<List<LeaderboardEntry>>(
        future: _leaderboardFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: AppTheme.neonAmber),
            );
          }

          final entries = snapshot.data ?? [];

          if (entries.isEmpty) {
            return const Center(
              child: Text(
                'No recorded escape runs yet. Be the first to escape!',
                style: TextStyle(color: AppTheme.textMuted),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 720),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.cardSurface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.containerBorder),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.military_tech_outlined, color: AppTheme.neonAmber, size: 24),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'TOP ESCAPE OPERATIVES',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    letterSpacing: 1.1,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Ranked by highest XP score, rooms completed, and speed.',
                                  style: TextStyle(color: AppTheme.textDim, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: entries.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final e = entries[i];
                        final rank = i + 1;
                        final isTop3 = rank <= 3;
                        final rankColor = rank == 1
                            ? const Color(0xFFFFD700)
                            : rank == 2
                                ? const Color(0xFFC0C0C0)
                                : rank == 3
                                    ? const Color(0xFFCD7F32)
                                    : AppTheme.textDim;

                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Row(
                              children: [
                                // Rank Badge
                                Container(
                                  width: 32,
                                  height: 32,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: rankColor.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: rankColor),
                                  ),
                                  child: Text(
                                    '#$rank',
                                    style: TextStyle(
                                      color: rankColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),

                                // Player Info
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        e.player,
                                        style: TextStyle(
                                          color: isTop3 ? Colors.white : Colors.white70,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Rooms: ${e.roomsCompleted}/5 • Time Left: ${e.timeRemaining}s',
                                        style: const TextStyle(color: AppTheme.textDim, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),

                                // Score
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '${e.score} XP',
                                      style: const TextStyle(
                                        color: AppTheme.neonAmber,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 14,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0D0F14),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: AppTheme.containerBorder),
                                      ),
                                      child: Text(
                                        e.difficulty.toUpperCase(),
                                        style: const TextStyle(
                                          color: AppTheme.textMuted,
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
