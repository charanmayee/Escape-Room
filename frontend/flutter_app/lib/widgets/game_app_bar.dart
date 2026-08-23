import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_controller.dart';
import '../models/game_models.dart';
import '../theme/app_theme.dart';
import 'inventory_sheet.dart';
import 'hint_dialog.dart';

class GameAppBar extends StatelessWidget implements PreferredSizeWidget {
  const GameAppBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(65);

  String _formatTimer(int totalSeconds) {
    final m = totalSeconds ~/ 60;
    final s = totalSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();
    final isLowTime = controller.remainingTime < 180;

    return AppBar(
      automaticallyImplyLeading: false,
      titleSpacing: 12,
      title: Row(
        children: [
          // Tactical Logo Icon
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.neonAmber,
              borderRadius: BorderRadius.circular(6),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.neonAmber.withOpacity(0.3),
                  blurRadius: 8,
                ),
              ],
            ),
            child: const Text(
              'AI',
              style: TextStyle(
                color: Color(0xFF0A0B10),
                fontWeight: FontWeight.w900,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Room Progress Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF161922),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppTheme.containerBorder),
            ),
            child: Text(
              'ROOM ${controller.currentRoom}/5',
              style: const TextStyle(
                color: AppTheme.neonAmber,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.1,
              ),
            ),
          ),

          const SizedBox(width: 8),

          // Lives (Hearts) Indicator
          Row(
            children: List.generate(
              controller.maxLives,
              (i) => Icon(
                Icons.favorite,
                size: 16,
                color: i < controller.lives ? AppTheme.neonRose : AppTheme.textDim,
              ),
            ),
          ),

          const Spacer(),

          // Countdown Timer
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: isLowTime ? AppTheme.neonRose.withOpacity(0.15) : const Color(0xFF161922),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: isLowTime ? AppTheme.neonRose : AppTheme.containerBorder,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.timer_outlined,
                  size: 15,
                  color: isLowTime ? AppTheme.neonRose : AppTheme.neonAmber,
                ),
                const SizedBox(width: 5),
                Text(
                  _formatTimer(controller.remainingTime),
                  style: TextStyle(
                    color: isLowTime ? AppTheme.neonRose : AppTheme.neonAmber,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          // Score XP
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF161922),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppTheme.containerBorder),
            ),
            child: Text(
              '${controller.score} XP',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
      actions: [
        // AI Hint Button
        IconButton(
          tooltip: 'Request AI Hint (${controller.hintsRemaining} left)',
          icon: Badge(
            label: Text('${controller.hintsRemaining}'),
            backgroundColor: AppTheme.neonAmber,
            textColor: const Color(0xFF0A0B10),
            child: const Icon(Icons.lightbulb_outline, color: AppTheme.neonAmber, size: 20),
          ),
          onPressed: () {
            showDialog(
              context: context,
              builder: (_) => const HintDialog(),
            );
          },
        ),

        // Inventory Clues Button
        IconButton(
          tooltip: 'Clue Inventory (${controller.discoveredClues.length})',
          icon: Badge(
            isLabelVisible: controller.discoveredClues.isNotEmpty,
            label: Text('${controller.discoveredClues.length}'),
            backgroundColor: AppTheme.neonEmerald,
            child: const Icon(Icons.inventory_2_outlined, color: Colors.white70, size: 20),
          ),
          onPressed: () {
            showModalBottomSheet(
              context: context,
              backgroundColor: Colors.transparent,
              builder: (_) => const InventorySheet(),
            );
          },
        ),

        // Surrender / Reset Run
        IconButton(
          tooltip: 'Abandon Run',
          icon: const Icon(Icons.restart_alt, color: AppTheme.neonRose, size: 20),
          onPressed: () {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: AppTheme.cardSurface,
                title: const Text('ABANDON RUN?', style: TextStyle(color: AppTheme.neonRose)),
                content: const Text(
                  'Are you sure you want to surrender this escape attempt and return to the main lobby?',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('CANCEL', style: TextStyle(color: Colors.white70)),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.neonRose),
                    onPressed: () {
                      Navigator.pop(ctx);
                      controller.resetGame();
                    },
                    child: const Text('ABANDON'),
                  ),
                ],
              ),
            );
          },
        ),
        const SizedBox(width: 8),
      ],
    );
  }
}
