import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/game_controller.dart';
import '../../services/api_service.dart';
import '../../models/game_models.dart';
import '../../theme/app_theme.dart';

class AiRiddleScreen extends StatefulWidget {
  const AiRiddleScreen({super.key});

  @override
  State<AiRiddleScreen> createState() => _AiRiddleScreenState();
}

class _AiRiddleScreenState extends State<AiRiddleScreen> {
  RiddleQuestion? _riddle;
  bool _loading = true;
  final TextEditingController _answerController = TextEditingController();
  bool _answerError = false;
  bool _showHint = false;

  @override
  void initState() {
    super.initState();
    _loadRiddle();
  }

  void _loadRiddle() async {
    setState(() => _loading = true);
    final controller = context.read<GameController>();
    final riddle = await ApiService.fetchAiRiddle(
      difficulty: controller.difficulty.label,
    );
    if (mounted) {
      setState(() {
        _riddle = riddle;
        _loading = false;
      });
    }
  }

  void _submitAnswer() async {
    final ans = _answerController.text.trim().toLowerCase();
    if (ans.isEmpty) return;

    final isCorrect = await ApiService.verifyPuzzleAnswer(
      room: 3,
      puzzleId: 'riddle',
      answer: ans,
    );

    if (isCorrect) {
      setState(() => _answerError = false);
      context.read<GameController>().unlockNextRoom(4, 500);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 AI RIDDLE SOLVED! Security Core bypassed. Moving to Room 4.'),
          backgroundColor: AppTheme.neonEmerald,
        ),
      );
    } else {
      setState(() => _answerError = true);
      context.read<GameController>().recordWrongAttempt();
    }
  }

  @override
  void dispose() {
    _answerController.dispose();
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
                  Icon(Icons.psychology_outlined, color: AppTheme.neonAmber, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'ROOM 3: THE NEURAL SYNAPSE CORE',
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
              Text(
                'The central AI mainframe generates dynamic riddle challenges calibrated to your operative tier (${controller.difficulty.label.toUpperCase()}). Answer the riddle to unlock the optical chamber portal.',
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildInspectChip('🧠 Neural Core Node', 'AI Core broadcasts cryptic computing metaphors.'),
                  _buildInspectChip('💾 Holographic Log', 'Single word lowercase responses are required.'),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Riddle Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: _loading
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Column(
                        children: [
                          CircularProgressIndicator(color: AppTheme.neonAmber),
                          SizedBox(height: 12),
                          Text('SYNTHESIZING NEURAL RIDDLE...', style: TextStyle(color: AppTheme.textDim, fontSize: 11)),
                        ],
                      ),
                    ),
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.neonCyan.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: AppTheme.neonCyan.withOpacity(0.5)),
                            ),
                            child: Text(
                              'THEME: ${_riddle?.theme.toUpperCase() ?? 'TECH'}',
                              style: const TextStyle(color: AppTheme.neonCyan, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Icons.refresh, size: 18, color: AppTheme.textMuted),
                            tooltip: 'Regenerate AI Riddle',
                            onPressed: _loadRiddle,
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text(
                        _riddle?.question ?? 'Loading riddle question...',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          height: 1.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (_showHint && _riddle != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0D0F14),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppTheme.neonAmber.withOpacity(0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.lightbulb_outline, size: 16, color: AppTheme.neonAmber),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _riddle!.hint,
                                  style: const TextStyle(color: Colors.white70, fontSize: 12, fontStyle: FontStyle.italic),
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        TextButton.icon(
                          icon: const Icon(Icons.lightbulb_outline, size: 16, color: AppTheme.neonAmber),
                          label: const Text('SHOW RIDDLE CLUE', style: TextStyle(color: AppTheme.neonAmber, fontSize: 11)),
                          onPressed: () => setState(() => _showHint = true),
                        ),
                    ],
                  ),
          ),
        ),

        const SizedBox(height: 16),

        // Answer Submission Card
        Card(
          color: const Color(0xFF161922),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.terminal, color: AppTheme.neonAmber, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'SUBMIT NEURAL OVERRIDE ANSWER',
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
                        controller: _answerController,
                        style: const TextStyle(
                          color: AppTheme.neonAmber,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        decoration: const InputDecoration(
                          hintText: 'e.g. keyboard, echo, cipher...',
                        ),
                        onSubmitted: (_) => _submitAnswer(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _submitAnswer,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                      ),
                      child: const Text('SUBMIT'),
                    ),
                  ],
                ),
                if (_answerError) ...[
                  const SizedBox(height: 8),
                  const Text(
                    '❌ INCORRECT AI ANSWER! Mainframe rejected code string.',
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
