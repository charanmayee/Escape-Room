import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/game_controller.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class BonusVaultScreen extends StatefulWidget {
  const BonusVaultScreen({super.key});

  @override
  State<BonusVaultScreen> createState() => _BonusVaultScreenState();
}

class _BonusVaultScreenState extends State<BonusVaultScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Mini Sudoku State (4x4)
  final List<List<int?>> _sudokuGrid = [
    [1, null, 3, 4],
    [3, 4, 1, 2],
    [null, 1, 4, 3],
    [4, 3, 2, 1],
  ];
  final Map<String, int?> _sudokuUserAnswers = {};
  bool _sudokuSolved = false;

  // Color Sequence State
  final List<String> _targetColors = ['CYAN', 'AMBER', 'ROSE', 'EMERALD'];
  final List<String> _userColorSeq = [];
  bool _colorSolved = false;

  // Spot Difference State
  int? _selectedCircuit;
  bool _spotSolved = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _checkSudoku() {
    // 0,1 should be 2; 2,0 should be 2
    final a = _sudokuUserAnswers['0_1'];
    final b = _sudokuUserAnswers['2_0'];

    if (a == 2 && b == 2) {
      setState(() => _sudokuSolved = true);
      context.read<GameController>().awardBonusPoints(150);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🎉 MINI SUDOKU SOLVED! +150 XP Bonus'), backgroundColor: AppTheme.neonEmerald),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('❌ Grid constraint violated! Each row & 2x2 box needs 1-4.'), backgroundColor: AppTheme.neonRose),
      );
    }
  }

  void _addColor(String color) {
    if (_colorSolved) return;
    setState(() {
      _userColorSeq.add(color);
      if (_userColorSeq.length == _targetColors.length) {
        if (_userColorSeq.join(',') == _targetColors.join(',')) {
          _colorSolved = true;
          context.read<GameController>().awardBonusPoints(150);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('🎉 CHROMA SEQUENCE LOCKED! +150 XP Bonus'), backgroundColor: AppTheme.neonEmerald),
          );
        } else {
          _userColorSeq.clear();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('❌ Incorrect sequence! Pattern reset.'), backgroundColor: AppTheme.neonRose),
          );
        }
      }
    });
  }

  void _checkSpotDifference(int circuitIndex) {
    setState(() => _selectedCircuit = circuitIndex);
    if (circuitIndex == 3) {
      setState(() => _spotSolved = true);
      context.read<GameController>().awardBonusPoints(150);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🎉 ANOMALY DETECTED! Circuit 3 resistor reversed. +150 XP'), backgroundColor: AppTheme.neonEmerald),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('❌ Normal circuit telemetry. Inspect other channels!'), backgroundColor: AppTheme.neonRose),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('MINI-GAME BONUS VAULT'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.neonAmber,
          labelColor: AppTheme.neonAmber,
          unselectedLabelColor: AppTheme.textDim,
          tabs: const [
            Tab(icon: Icon(Icons.grid_4x4), text: 'Sudoku'),
            Tab(icon: Icon(Icons.palette_outlined), text: 'Chroma Sequence'),
            Tab(icon: Icon(Icons.compare), text: 'Spot Difference'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSudokuTab(),
          _buildColorSequenceTab(),
          _buildSpotDifferenceTab(),
        ],
      ),
    );
  }

  Widget _buildSudokuTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                '4×4 QUANTUM MATRIX SUDOKU',
                style: TextStyle(color: AppTheme.neonAmber, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 6),
              const Text(
                'Fill empty cells so that each row, column, and 2×2 quadrant contains numbers 1 through 4 exactly once.',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF11131A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.containerBorder),
                ),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    crossAxisSpacing: 6,
                    mainAxisSpacing: 6,
                  ),
                  itemCount: 16,
                  itemBuilder: (ctx, i) {
                    final r = i ~/ 4;
                    final c = i % 4;
                    final fixedVal = _sudokuGrid[r][c];

                    if (fixedVal != null) {
                      return Container(
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1A1D27),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.containerBorder),
                        ),
                        child: Text(
                          '$fixedVal',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      );
                    }

                    final key = '${r}_$c';
                    final currentVal = _sudokuUserAnswers[key];

                    return DropdownButtonHideUnderline(
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF0D0F14),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.neonAmber),
                        ),
                        alignment: Alignment.center,
                        child: DropdownButton<int>(
                          value: currentVal,
                          dropdownColor: AppTheme.cardSurface,
                          hint: const Text('?', style: TextStyle(color: AppTheme.neonAmber, fontWeight: FontWeight.bold)),
                          items: [1, 2, 3, 4].map((n) {
                            return DropdownMenuItem(value: n, child: Text('$n', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)));
                          }).toList(),
                          onChanged: (val) {
                            setState(() {
                              _sudokuUserAnswers[key] = val;
                            });
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _sudokuSolved ? null : _checkSudoku,
                child: Text(_sudokuSolved ? 'MATRIX VALIDATED (+150 XP)' : 'VALIDATE SUDOKU GRID'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildColorSequenceTab() {
    final colors = [
      {'name': 'CYAN', 'color': AppTheme.neonCyan},
      {'name': 'AMBER', 'color': AppTheme.neonAmber},
      {'name': 'ROSE', 'color': AppTheme.neonRose},
      {'name': 'EMERALD', 'color': AppTheme.neonEmerald},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'NEON CHROMA FREQUENCY MEMORY',
                style: TextStyle(color: AppTheme.neonAmber, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 6),
              const Text(
                'Input the tactical 4-phase color sequence in the correct wavelength order: CYAN → AMBER → ROSE → EMERALD.',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
              const SizedBox(height: 20),
              // Current Sequence Progress
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF11131A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.containerBorder),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(4, (i) {
                    if (i < _userColorSeq.length) {
                      final name = _userColorSeq[i];
                      final c = colors.firstWhere((e) => e['name'] == name)['color'] as Color;
                      return Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: c,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [BoxShadow(color: c.withOpacity(0.4), blurRadius: 10)],
                        ),
                      );
                    }
                    return Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D0F14),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppTheme.containerBorder),
                      ),
                      child: const Center(child: Text('•', style: TextStyle(color: AppTheme.textDim))),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 24),
              // Color Buttons
              GridView.count(
                shrinkWrap: true,
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.6,
                children: colors.map((c) {
                  final color = c['color'] as Color;
                  final name = c['name'] as String;
                  return ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: color.withOpacity(0.2),
                      foregroundColor: color,
                      side: BorderSide(color: color, width: 1.5),
                    ),
                    onPressed: () => _addColor(name),
                    child: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSpotDifferenceTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'CIRCUIT ANOMALY ISOLATOR',
                style: TextStyle(color: AppTheme.neonAmber, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 6),
              const Text(
                'Compare the 4 server circuit bus channels below. One of the channels contains an anomalous reversed diode polarity. Select the anomalous circuit channel:',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
              const SizedBox(height: 20),
              ...[1, 2, 3, 4].map((n) {
                final isSelected = _selectedCircuit == n;
                final isAnomaly = n == 3;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(
                      color: isSelected
                          ? (isAnomaly ? AppTheme.neonEmerald : AppTheme.neonRose)
                          : AppTheme.containerBorder,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D0F14),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text('CH-$n', style: const TextStyle(color: AppTheme.neonAmber, fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                    title: Text(
                      isAnomaly ? '⚡ 5.0V ──[▶|]── (REVERSED BIAS) ── 0.0V' : '⚡ 5.0V ──[|◀]── (FORWARD BIAS) ── 0.0V',
                      style: TextStyle(
                        color: isAnomaly && _spotSolved ? AppTheme.neonEmerald : Colors.white,
                        fontFamily: 'monospace',
                        fontSize: 12,
                      ),
                    ),
                    trailing: ElevatedButton(
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                      onPressed: () => _checkSpotDifference(n),
                      child: const Text('ISOLATE', style: TextStyle(fontSize: 11)),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
