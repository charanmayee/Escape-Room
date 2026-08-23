import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/game_controller.dart';
import '../../services/api_service.dart';
import '../../models/game_models.dart';
import '../../theme/app_theme.dart';

class DecapitatedWordsScreen extends StatefulWidget {
  const DecapitatedWordsScreen({super.key});

  @override
  State<DecapitatedWordsScreen> createState() => _DecapitatedWordsScreenState();
}

class _DecapitatedWordsScreenState extends State<DecapitatedWordsScreen> {
  final List<Map<String, String>> _ciphers = [
    {'id': 'd1', 'clue': 'University grounds', 'pattern': '_AMPU_', 'answer': 'CAMPUS'},
    {'id': 'd2', 'clue': 'Book depository & research sanctuary', 'pattern': '_IBRAR_', 'answer': 'LIBRARY'},
    {'id': 'd3', 'clue': 'Step-by-step computational logic', 'pattern': '_LGORITH_', 'answer': 'ALGORITHM'},
    {'id': 'd4', 'clue': 'Structured repository for persistent records', 'pattern': '_ATABAS_', 'answer': 'DATABASE'},
    {'id': 'd5', 'clue': 'Academic half-year period', 'pattern': '_EMESTE_', 'answer': 'SEMESTER'},
  ];

  final Map<String, bool> _solvedStatus = {};
  final TextEditingController _doorController = TextEditingController();
  bool _doorError = false;

  void _checkWord(String id, String val) async {
    final clean = val.trim().toUpperCase();
    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 2,
      puzzleId: id,
      answer: clean,
    );

    if (isCorrect && !(_solvedStatus[id] ?? false)) {
      setState(() {
        _solvedStatus[id] = true;
      });
      context.read<GameController>().awardBonusPoints(60);
    }
  }

  void _submitDoorKey() async {
    final key = _doorController.text.trim().toUpperCase();
    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 2,
      puzzleId: 'door',
      answer: key,
    );

    if (isCorrect) {
      setState(() => _doorError = false);
      context.read<GameController>().unlockNextRoom(3, 400);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 SECURITY AIRLOCK 2 UNLOCKED! Moving to Room 3.'),
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
                  Icon(Icons.shield_outlined, color: AppTheme.neonAmber, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'ROOM 2: DECAPITATED CIPHER ARCHIVE',
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
                'Corrupted archive files have lost their leading and trailing boundary characters. Restore each word based on its context clue to deduce the sector passkey.',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildInspectChip('📜 Archive Ledger', 'Notice: Missing front and rear characters match standard academic vocabulary.'),
                  _buildInspectChip('🔒 Secure Safe Door', 'Requires master decryption override passphrase.'),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Ciphers List
        ..._ciphers.map((cipher) {
          final id = cipher['id']!;
          final isSolved = _solvedStatus[id] == true;

          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        cipher['pattern']!,
                        style: const TextStyle(
                          color: AppTheme.neonAmber,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          letterSpacing: 3.0,
                          fontFamily: 'monospace',
                        ),
                      ),
                      const Spacer(),
                      if (isSolved)
                        const Row(
                          children: [
                            Icon(Icons.check_circle, color: AppTheme.neonEmerald, size: 16),
                            SizedBox(width: 4),
                            Text('RESTORED', style: TextStyle(color: AppTheme.neonEmerald, fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    cipher['clue']!,
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  ),
                  const SizedBox(height: 10),
                  TextField(
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
                      hintText: isSolved ? 'RESTORED' : 'Enter complete word...',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    onChanged: (val) => _checkWord(id, val),
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
                    Icon(Icons.vpn_key_outlined, color: AppTheme.neonAmber, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'SECTOR 2 VAULT DECRYPTION KEY',
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
                        textCapitalization: TextCapitalization.characters,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppTheme.neonAmber,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2.5,
                        ),
                        decoration: const InputDecoration(
                          hintText: 'ENTER OVERRIDE KEY...',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _submitDoorKey,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                      ),
                      child: const Text('DISENGAGE LOCK'),
                    ),
                  ],
                ),
                if (_doorError) ...[
                  const SizedBox(height: 8),
                  const Text(
                    '❌ INVALID OVERRIDE KEY! Restore all ciphers or verify passphrase.',
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
