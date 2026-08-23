import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/game_controller.dart';
import '../../services/api_service.dart';
import '../../models/game_models.dart';
import '../../theme/app_theme.dart';

class RebusPuzzleScreen extends StatefulWidget {
  const RebusPuzzleScreen({super.key});

  @override
  State<RebusPuzzleScreen> createState() => _RebusPuzzleScreenState();
}

class _RebusPuzzleScreenState extends State<RebusPuzzleScreen> {
  final List<Map<String, dynamic>> _rebusCards = [
    {
      'id': 'r1',
      'label': 'CARD ALPHA',
      'visual': 'CYCLE\nCYCLE\nCYCLE',
      'hint': 'Count the cycles...',
      'digitClue': 'Digit 1: 4',
    },
    {
      'id': 'r2',
      'label': 'CARD BETA',
      'visual': '  MAN  \n───────\n BOARD ',
      'hint': 'Spatial position of the word...',
      'digitClue': 'Digit 2: 8',
    },
    {
      'id': 'r3',
      'label': 'CARD GAMMA',
      'visual': 'FORGET',
      'hint': 'What common phrase is missing its second word?',
      'digitClue': 'Digit 3: 2',
    },
    {
      'id': 'r4',
      'label': 'CARD DELTA',
      'visual': '✦ LIGHTS ✦',
      'hint': 'Glow of rare noble gas lamps...',
      'digitClue': 'Digit 4: 7',
    },
  ];

  final Map<String, bool> _solvedCards = {};
  final TextEditingController _safeController = TextEditingController();
  bool _safeError = false;

  void _verifyCard(String id, String val) async {
    final clean = val.trim().toUpperCase();
    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 4,
      puzzleId: id,
      answer: clean,
    );

    if (isCorrect && !(_solvedCards[id] ?? false)) {
      setState(() {
        _solvedCards[id] = true;
      });
      context.read<GameController>().awardBonusPoints(75);
    }
  }

  void _submitSafeCode() async {
    final code = _safeController.text.trim();
    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 4,
      puzzleId: 'safe',
      answer: code,
    );

    if (isCorrect) {
      setState(() => _safeError = false);
      context.read<GameController>().unlockNextRoom(5, 500);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 MASTER SAFE OPENED! Vault Keycard Acquired. Entering Room 5.'),
          backgroundColor: AppTheme.neonEmerald,
        ),
      );
    } else {
      setState(() => _safeError = true);
      context.read<GameController>().recordWrongAttempt();
    }
  }

  @override
  void dispose() {
    _safeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
                  Icon(Icons.visibility_outlined, color: AppTheme.neonAmber, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'ROOM 4: OPTICAL REBUS GALLERY',
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
                'The gallery showcases 4 optical rebus visual puzzles. Solve each idiom to decode the laser safe combination dial.',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildInspectChip('🖼 Framed Canvas', 'Look closely at word positioning and repetition.'),
                  _buildInspectChip('🕰 Laser Safe Dial', 'Enter the 4-digit code to disengage safety bolts.'),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Grid of 4 Rebus Cards
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.95,
          ),
          itemCount: _rebusCards.length,
          itemBuilder: (ctx, i) {
            final card = _rebusCards[i];
            final id = card['id'] as String;
            final isSolved = _solvedCards[id] == true;

            return Card(
              color: isSolved ? const Color(0xFF0F1A15) : const Color(0xFF11131A),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(
                  color: isSolved ? AppTheme.neonEmerald : AppTheme.containerBorder,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          card['label'] as String,
                          style: const TextStyle(
                            color: AppTheme.neonAmber,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                        if (isSolved)
                          const Icon(Icons.check_circle, color: AppTheme.neonEmerald, size: 16),
                      ],
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0B10),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.containerBorder),
                      ),
                      child: Text(
                        card['visual'] as String,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2.0,
                        ),
                      ),
                    ),
                    const Spacer(),
                    TextField(
                      enabled: !isSolved,
                      textCapitalization: TextCapitalization.characters,
                      style: TextStyle(
                        color: isSolved ? AppTheme.neonEmerald : Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                      decoration: InputDecoration(
                        isDense: true,
                        hintText: isSolved ? 'SOLVED' : 'Solve rebus...',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      ),
                      onChanged: (val) => _verifyCard(id, val),
                    ),
                  ],
                ),
              ),
            );
          },
        ),

        const SizedBox(height: 16),

        // Master 4-Digit Safe Keypad
        Card(
          color: const Color(0xFF161922),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: BorderSide(
              color: _safeError ? AppTheme.neonRose : AppTheme.neonAmber.withOpacity(0.6),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.dialpad, color: AppTheme.neonAmber, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'OPTICAL GALLERY SAFE COMBINATION',
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
                        controller: _safeController,
                        keyboardType: TextInputType.number,
                        maxLength: 4,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppTheme.neonAmber,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 6.0,
                        ),
                        decoration: const InputDecoration(
                          counterText: '',
                          hintText: '• • • •',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _submitSafeCode,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                      ),
                      child: const Text('DISENGAGE SAFE'),
                    ),
                  ],
                ),
                if (_safeError) ...[
                  const SizedBox(height: 8),
                  const Text(
                    '❌ SAFE ACCESS DENIED! Verify individual card solutions.',
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
