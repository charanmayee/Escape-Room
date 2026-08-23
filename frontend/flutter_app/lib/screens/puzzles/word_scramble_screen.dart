import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/game_controller.dart';
import '../../services/api_service.dart';
import '../../models/game_models.dart';
import '../../theme/app_theme.dart';

class WordScrambleScreen extends StatefulWidget {
  const WordScrambleScreen({super.key});

  @override
  State<WordScrambleScreen> createState() => _WordScrambleScreenState();
}

class _WordScrambleScreenState extends State<WordScrambleScreen> {
  final Map<String, String> _scrambledList = {
    'w1': 'NTOHYP',
    'w2': 'LEGCOLE',
    'w3': 'DENTTSU',
    'w4': 'CEJOTRP',
    'w5': 'INGDCO',
  };

  final Map<String, String> _userInputs = {};
  final Map<String, bool> _solvedStatus = {};
  final TextEditingController _doorController = TextEditingController();
  bool _doorError = false;

  void _checkWord(String id, String val) async {
    final clean = val.trim().toUpperCase();
    _userInputs[id] = clean;

    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 1,
      puzzleId: id,
      answer: clean,
    );

    if (isCorrect && !(_solvedStatus[id] ?? false)) {
      setState(() {
        _solvedStatus[id] = true;
      });
      context.read<GameController>().awardBonusPoints(50);
    }
  }

  void _submitDoorKey() async {
    final key = _doorController.text.trim().toUpperCase();
    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 1,
      puzzleId: 'door',
      answer: key,
    );

    if (isCorrect) {
      setState(() => _doorError = false);
      context.read<GameController>().unlockNextRoom(2, 300);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 SECURITY AIRLOCK 1 UNLOCKED! Moving to Room 2.'),
          backgroundColor: AppTheme.neonEmerald,
        ),
      );
    } else {
      setState(() => _doorError = true);
      context.read<GameController>().recordWrongAttempt();
    }
  }

  @override
  void dispose() {
    _doorController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Room Briefing Banner
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.cardSurface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppTheme.containerBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.door_back_door_outlined, color: AppTheme.neonAmber, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'ROOM 1: THE DORMITORY TERMINAL',
                    style: TextStyle(
                      color: AppTheme.neonAmber,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'A dorm room terminal has scrambled 5 essential programming terms. Unscramble each word, then collect the FIRST letter of each word to form the 5-letter emergency master override key.',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildInspectChip('☕ Coffee Mug', 'Under the mug: Combine the first letter of each solved word.'),
                  _buildInspectChip('💻 Terminal Screen', 'Displays corrupted campus memory sectors.'),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Scramble Inputs List
        ..._scrambledList.entries.map((entry) {
          final id = entry.key;
          final scrambled = entry.value;
          final isSolved = _solvedStatus[id] == true;

          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isSolved ? AppTheme.neonEmerald.withOpacity(0.2) : const Color(0xFF0D0F14),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isSolved ? AppTheme.neonEmerald : AppTheme.containerBorder,
                      ),
                    ),
                    child: Icon(
                      isSolved ? Icons.check : Icons.lock_outline,
                      size: 16,
                      color: isSolved ? AppTheme.neonEmerald : AppTheme.textDim,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    scrambled,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      enabled: !isSolved,
                      textCapitalization: TextCapitalization.characters,
                      style: TextStyle(
                        color: isSolved ? AppTheme.neonEmerald : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        letterSpacing: 1.5,
                      ),
                      decoration: InputDecoration(
                        isDense: true,
                        hintText: isSolved ? 'RESOLVED' : 'Unscramble...',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      onChanged: (val) => _checkWord(id, val),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),

        const SizedBox(height: 16),

        // Door Override Keypad
        Card(
          color: const Color(0xFF161922),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: BorderSide(
              color: _doorError ? AppTheme.neonRose : AppTheme.neonAmber.withOpacity(0.6),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.key, color: AppTheme.neonAmber, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'SECTOR 1 DOOR OVERRIDE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _doorController,
                        maxLength: 5,
                        textCapitalization: TextCapitalization.characters,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppTheme.neonAmber,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 4.0,
                        ),
                        decoration: const InputDecoration(
                          counterText: '',
                          hintText: '_ _ _ _ _',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _submitDoorKey,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                      ),
                      child: const Text('UNLOCK DOOR'),
                    ),
                  ],
                ),
                if (_doorError) ...[
                  const SizedBox(height: 8),
                  const Text(
                    '❌ INCORRECT OVERRIDE KEY! Time penalty applied.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.neonRose, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ],
            ),
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
