import 'package:flutter/material.dart';

/// Comprehensive theme configuration for the AI Escape Room Flutter application.
/// Accurately matches the mystery-themed, tactical dark cyber UI of the React web app.
class ThemeConfig {
  // ─── Surface & Background Colors ──────────────────────────────────────────
  static const Color background = Color(0xFF0A0B10);       // Ultra-dark carbon abyss
  static const Color surface = Color(0xFF11131A);          // Deep card surface
  static const Color surfaceElevated = Color(0xFF161922);  // Elevated container / keypad
  static const Color surfaceSubtle = Color(0xFF0D0F14);    // Input fields & inset boxes
  static const Color surfaceAccent = Color(0xFF1F2430);    // Progress bar tracks & headers

  // ─── Border & Divider Colors ──────────────────────────────────────────────
  static const Color border = Color(0xFF2D2D3D);           // Default subtle container border
  static const Color borderSubtle = Color(0xFF1F2430);     // Very soft separator
  static const Color borderBright = Color(0xFF3F3F56);     // Interactive hover / active border

  // ─── Accent & Neon Glow Colors ───────────────────────────────────────────
  static const Color neonAmber = Color(0xFFF59E0B);        // Primary tactical accent (Amber 500)
  static const Color neonAmberGlow = Color(0x59F59E0B);    // Amber shadow glow (35% alpha)
  static const Color neonEmerald = Color(0xFF10B981);      // Success & solved status (Emerald 500)
  static const Color neonEmeraldGlow = Color(0x4010B981);  // Emerald shadow glow (25% alpha)
  static const Color neonRose = Color(0xFFEF4444);         // Alarm, error & penalty (Red 500)
  static const Color neonRoseGlow = Color(0x4DEE4444);     // Alarm pulse glow (30% alpha)
  static const Color neonCyan = Color(0xFF06B6D4);         // Synapse & laser frequencies (Cyan 500)
  static const Color neonCyanGlow = Color(0x4006B6D4);     // Cyan synapse glow (25% alpha)
  static const Color neonPurple = Color(0xFFA855F7);       // Enigma & quantum puzzles (Purple 500)

  // ─── Typography Colors ───────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFFFFFFFF);      // High-contrast primary text
  static const Color textSecondary = Color(0xFFE2E8F0);    // Crisp secondary copy
  static const Color textMuted = Color(0xFF9CA3AF);        // Narrative description text
  static const Color textDim = Color(0xFF6B7280);          // Placeholder & subtle captions
  static const Color textInverse = Color(0xFF0A0B10);      // High-contrast dark text on glowing buttons

  // ─── Custom Card & Container BoxDecorations ──────────────────────────────
  static BoxDecoration get baseCardDecoration => BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border, width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 14,
            offset: Offset(0, 4),
          ),
        ],
      );

  static BoxDecoration get elevatedCardDecoration => BoxDecoration(
        color: surfaceElevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border, width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color(0x80000000),
            blurRadius: 18,
            offset: Offset(0, 6),
          ),
        ],
      );

  static BoxDecoration get glowingAmberCardDecoration => BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: neonAmber.withOpacity(0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: neonAmberGlow,
            blurRadius: 20,
            spreadRadius: 1,
            offset: const Offset(0, 2),
          ),
        ],
      );

  static BoxDecoration get glowingEmeraldCardDecoration => BoxDecoration(
        color: const Color(0xFF0F1A15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: neonEmerald, width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: neonEmeraldGlow,
            blurRadius: 16,
            spreadRadius: 1,
          ),
        ],
      );

  static BoxDecoration get glowingRoseCardDecoration => BoxDecoration(
        color: const Color(0xFF1F1215),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: neonRose, width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: neonRoseGlow,
            blurRadius: 18,
            spreadRadius: 1,
          ),
        ],
      );

  static BoxDecoration get terminalScreenDecoration => BoxDecoration(
        color: surfaceSubtle,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: border, width: 1),
      );

  // ─── Custom TextStyles & Typography Hierarchy ────────────────────────────
  static const TextStyle displayHeadline = TextStyle(
    color: textPrimary,
    fontSize: 22,
    fontWeight: FontWeight.w900,
    letterSpacing: 3.0,
    fontFamily: 'monospace',
  );

  static const TextStyle chamberTitle = TextStyle(
    color: neonAmber,
    fontSize: 14,
    fontWeight: FontWeight.w800,
    letterSpacing: 1.4,
    fontFamily: 'monospace',
  );

  static const TextStyle sectionHeader = TextStyle(
    color: textPrimary,
    fontSize: 13,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  );

  static const TextStyle bodyNarrative = TextStyle(
    color: textMuted,
    fontSize: 13,
    height: 1.5,
    fontFamily: 'sans-serif',
  );

  static const TextStyle codeDisplay = TextStyle(
    color: neonAmber,
    fontSize: 16,
    fontWeight: FontWeight.bold,
    letterSpacing: 4.0,
    fontFamily: 'monospace',
  );

  static const TextStyle cipherText = TextStyle(
    color: textPrimary,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    letterSpacing: 3.0,
    fontFamily: 'monospace',
  );

  static const TextStyle hudTimer = TextStyle(
    color: neonAmber,
    fontSize: 14,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  );

  static const TextStyle buttonLabel = TextStyle(
    color: textInverse,
    fontSize: 13,
    fontWeight: FontWeight.w900,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  );

  // ─── Complete Flutter ThemeData ──────────────────────────────────────────
  static ThemeData get themeData {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: neonAmber,
      colorScheme: const ColorScheme.dark(
        primary: neonAmber,
        secondary: neonEmerald,
        tertiary: neonCyan,
        surface: surface,
        error: neonRose,
        onPrimary: textInverse,
        onSecondary: textInverse,
        onSurface: textPrimary,
        onError: textPrimary,
      ),
      fontFamily: 'monospace',

      // App Bar Configuration
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: neonAmber),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 15,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
          fontFamily: 'monospace',
        ),
      ),

      // Card Configuration
      cardTheme: CardTheme(
        color: surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: border, width: 1),
        ),
      ),

      // Dialog Configuration
      dialogTheme: DialogTheme(
        backgroundColor: surfaceElevated,
        surfaceTintColor: Colors.transparent,
        elevation: 16,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: border, width: 1),
        ),
        titleTextStyle: const TextStyle(
          color: textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
          fontFamily: 'monospace',
        ),
        contentTextStyle: const TextStyle(
          color: textMuted,
          fontSize: 13,
          height: 1.5,
          fontFamily: 'sans-serif',
        ),
      ),

      // Bottom Sheet Configuration
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          side: BorderSide(color: neonAmber, width: 2),
        ),
      ),

      // Input Decoration (Tactical Cyber Terminal)
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceSubtle,
        hintStyle: const TextStyle(color: textDim, fontSize: 13, fontFamily: 'monospace'),
        labelStyle: const TextStyle(color: neonAmber, fontSize: 13, fontFamily: 'monospace'),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: neonAmber, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: neonRose, width: 1.5),
        ),
      ),

      // Buttons Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: neonAmber,
          foregroundColor: textInverse,
          disabledBackgroundColor: surfaceSubtle,
          disabledForegroundColor: textDim,
          elevation: 2,
          shadowColor: neonAmberGlow,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: buttonLabel,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: neonAmber,
          side: const BorderSide(color: neonAmber, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(
            color: neonAmber,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            fontFamily: 'monospace',
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: neonAmber,
          textStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.1,
            fontFamily: 'monospace',
          ),
        ),
      ),

      dividerTheme: const DividerThemeData(
        color: border,
        thickness: 1,
        space: 24,
      ),
    );
  }
}
