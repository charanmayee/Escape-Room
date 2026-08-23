import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/game_controller.dart';
import '../theme/app_theme.dart';

class InventorySheet extends StatelessWidget {
  const InventorySheet({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();
    final clues = controller.discoveredClues;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: AppTheme.cardSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        border: Border(top: BorderSide(color: AppTheme.neonAmber, width: 2)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.inventory_2_outlined, color: AppTheme.neonAmber, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'DISCOVERED CLUES & ARTIFACTS (${clues.length})',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white60, size: 18),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const Divider(color: AppTheme.containerBorder),
          const SizedBox(height: 8),
          if (clues.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.center,
              child: const Column(
                children: [
                  Icon(Icons.search_off, size: 36, color: AppTheme.textDim),
                  SizedBox(height: 8),
                  Text(
                    'No clues discovered yet.',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Click on highlighted environment items inside chambers to gather clues!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.textDim, fontSize: 11),
                  ),
                ],
              ),
            )
          else
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: clues.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (ctx, i) {
                  final c = clues[i];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF161922),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.containerBorder),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.icon, style: const TextStyle(fontSize: 24)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                c.title,
                                style: const TextStyle(
                                  color: AppTheme.neonAmber,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                c.description,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
