import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_controller.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class HintDialog extends StatefulWidget {
  const HintDialog({super.key});

  @override
  State<HintDialog> createState() => _HintDialogState();
}

class _HintDialogState extends State<HintDialog> {
  bool _loading = false;
  String? _hintText;

  Future<void> _requestHint(GameController controller) async {
    if (controller.hintsRemaining <= 0) return;

    setState(() => _loading = true);

    final currentRoom = controller.currentRoom;
    final hint = await ApiService.fetchAiHint(
      room: 'Room $currentRoom',
      puzzleTitle: 'Chamber $currentRoom Puzzle',
      puzzleDetail: 'Active decryption challenge',
    );

    controller.useHint();

    setState(() {
      _loading = false;
      _hintText = hint;
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();

    return AlertDialog(
      backgroundColor: AppTheme.cardSurface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppTheme.containerBorder),
      ),
      title: Row(
        children: [
          const Icon(Icons.lightbulb, color: AppTheme.neonAmber, size: 22),
          const SizedBox(width: 8),
          const Text(
            'TACTICAL AI HINT',
            style: TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Remaining Hints: ${controller.hintsRemaining}',
            style: const TextStyle(color: AppTheme.neonAmber, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          if (_loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(color: AppTheme.neonAmber),
              ),
            )
          else if (_hintText != null)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF161922),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.neonAmber.withOpacity(0.5)),
              ),
              child: Text(
                _hintText!,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  height: 1.4,
                  fontStyle: FontStyle.italic,
                ),
              ),
            )
          else
            const Text(
              'Requesting an AI hint will consume 1 hint credit and apply a minor 10s tactical penalty to your clock.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.4),
            ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('CLOSE', style: TextStyle(color: Colors.white70)),
        ),
        if (_hintText == null && controller.hintsRemaining > 0)
          ElevatedButton(
            onPressed: () => _requestHint(controller),
            child: const Text('REVEAL CLUE'),
          ),
      ],
    );
  }
}
