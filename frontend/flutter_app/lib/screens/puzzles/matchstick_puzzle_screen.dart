import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/game_controller.dart';
import '../../services/api_service.dart';
import '../../models/game_models.dart';
import '../../theme/app_theme.dart';

class MatchstickPuzzleScreen extends StatefulWidget {
  const MatchstickPuzzleScreen({super.key});

  @override
  State<MatchstickPuzzleScreen> createState() => _MatchstickPuzzleScreenState();
}

class _MatchstickPuzzleScreenState extends State<MatchstickPuzzleScreen> {
  final TextEditingController _matchController = TextEditingController();
  final TextEditingController _seqController = TextEditingController();

  bool _matchSolved = false;
  bool _seqSolved = false;
  bool _matchError = false;
  bool _seqError = false;

  void _verifyMatch() async {
    final ans = _matchController.text.trim();
    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 5,
      puzzleId: 'match',
      answer: ans,
    );

    if (isCorrect) {
      setState(() {
        _matchSolved = true;
        _matchError = false;
      });
      context.read<GameController>().awardBonusPoints(100);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🔥 MATCHSTICK EQUATION BALANCED!'), backgroundColor: AppTheme.neonEmerald),
      );
    } else {
      setState(() => _matchError = true);
      context.read<GameController>().recordWrongAttempt();
    }
  }

  void _verifySequence() async {
    final ans = _seqController.text.trim();
    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 5,
      puzzleId: 'sequence',
      answer: ans,
    );

    if (isCorrect) {
      setState(() {
        _seqSolved = true;
        _seqError = false;
      });
      context.read<GameController>().awardBonusPoints(100);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('⚡ FIBONACCI LASER SYNCED!'), backgroundColor: AppTheme.neonEmerald),
      );
    } else {
      setState(() => _seqError = true);
      context.read<GameController>().recordWrongAttempt();
    }
  }

  void _triggerFinalEscape() {
    if (_matchSolved && _seqSolved) {
      context.read<GameController>().triggerVictory();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ BOTH LOCKDOWN CHALLENGES MUST BE RESOLVED!'),
          backgroundColor: AppTheme.neonRose,
        ),
      );
    }
  }

  @override
  void dispose() {
    _matchController.dispose();
    _seqController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canEscape = _matchSolved && _seqSolved;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Room Briefing Banner
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.cardSurface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppTheme.neonRose.withOpacity(0.6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: AppTheme.neonRose, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'ROOM 5: FINAL AIRLOCK CONTAINMENT VAULT',
                    style: TextStyle(
                      color: AppTheme.neonRose,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'The blast doors to the surface are secured with dual cryptographic locks: a matchstick logic equation and a Fibonacci laser frequency generator. Solve both to execute the emergency escape protocol!',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildInspectChip('🕯 Torch Sconce', 'Move 1 matchstick segment to balance the arithmetic.'),
                  _buildInspectChip('🧱 Floor Matrix', 'Sum consecutive sequence pairs to find the missing frequency.'),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Challenge A: Matchstick
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'CHALLENGE A: MATCHSTICK EQUATION',
                      style: TextStyle(color: AppTheme.neonAmber, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    if (_matchSolved)
                      const Icon(Icons.check_circle, color: AppTheme.neonEmerald, size: 18),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D0F14),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.containerBorder),
                  ),
                  child: const Text(
                    '𝟔 + 𝟒 = 𝟒',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 6.0,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Move exactly 1 matchstick to correct the equation. Enter balanced formula:',
                  style: TextStyle(color: AppTheme.textDim, fontSize: 11),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _matchController,
                        enabled: !_matchSolved,
                        style: TextStyle(
                          color: _matchSolved ? AppTheme.neonEmerald : Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        decoration: InputDecoration(
                          hintText: _matchSolved ? 'BALANCED' : 'e.g. 0 + 4 = 4',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    if (!_matchSolved)
                      ElevatedButton(
                        onPressed: _verifyMatch,
                        child: const Text('VERIFY'),
                      ),
                  ],
                ),
                if (_matchError) ...[
                  const SizedBox(height: 6),
                  const Text('❌ INCORRECT MATCH EQUATION! Try adjusting the first digit.', style: TextStyle(color: AppTheme.neonRose, fontSize: 11)),
                ],
              ],
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Challenge B: Fibonacci Laser
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'CHALLENGE B: FIBONACCI LASER SYNC',
                      style: TextStyle(color: AppTheme.neonCyan, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    if (_seqSolved)
                      const Icon(Icons.check_circle, color: AppTheme.neonEmerald, size: 18),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D0F14),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.containerBorder),
                  ),
                  child: const Text(
                    '1,  1,  2,  3,  5,  8,  13,  [ ? ]',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.neonCyan,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.0,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Calculate the next sequence term to align the laser lens:',
                  style: TextStyle(color: AppTheme.textDim, fontSize: 11),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _seqController,
                        enabled: !_seqSolved,
                        keyboardType: TextInputType.number,
                        style: TextStyle(
                          color: _seqSolved ? AppTheme.neonEmerald : Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        decoration: InputDecoration(
                          hintText: _seqSolved ? 'SYNCED' : 'Next number...',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    if (!_seqSolved)
                      ElevatedButton(
                        onPressed: _verifySequence,
                        child: const Text('SYNC'),
                      ),
                  ],
                ),
                if (_seqError) ...[
                  const SizedBox(height: 6),
                  const Text('❌ FREQUENCY MISMATCH! Sum 8 + 13 to align.', style: TextStyle(color: AppTheme.neonRose, fontSize: 11)),
                ],
              ],
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Master Escape Action Button
        ElevatedButton(
          onPressed: canEscape ? _triggerFinalEscape : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: canEscape ? AppTheme.neonEmerald : const Color(0xFF222533),
            foregroundColor: canEscape ? const Color(0xFF0A0B10) : Colors.white38,
            padding: const EdgeInsets.symmetric(vertical: 18),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(canEscape ? Icons.lock_open : Icons.lock, size: 20),
              const SizedBox(width: 10),
              Text(
                canEscape ? '🚨 EXECUTE EMERGENCY ESCAPE 🚨' : 'SOLVE DUAL CHALLENGES TO ESCAPE',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInspectChip(String label, String clueText) {
    return ActionChip(
      backgroundColor: const Color(0xFF0D0F14),
      side: const BorderSide(color: AppTheme.containerBorder),
      avatar: const Icon(Icons.search, size: 14, color: AppTheme.neonAmber),
      label: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      onPressed: () {
        context.read<GameController>().discoverClue(
              ClueItem(
                id: label.toLowerCase().replaceAll(' ', '_'),
                title: label,
                icon: '🔍',
                description: clueText,
              ),
            );
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Clue added to Inventory: $label'),
            backgroundColor: AppTheme.cardSurface,
          ),
        );
      },
    );
  }
}
