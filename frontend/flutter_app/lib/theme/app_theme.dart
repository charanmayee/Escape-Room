import 'package:flutter/material.dart';
import 'theme_config.dart';

class AppTheme {
  // Brand Tactical Color Palette (Proxied from ThemeConfig)
  static const Color darkBackground = ThemeConfig.background;
  static const Color cardSurface = ThemeConfig.surface;
  static const Color containerBorder = ThemeConfig.border;
  static const Color cardElevated = ThemeConfig.surfaceElevated;

  static const Color neonAmber = ThemeConfig.neonAmber;
  static const Color neonEmerald = ThemeConfig.neonEmerald;
  static const Color neonRose = ThemeConfig.neonRose;
  static const Color neonCyan = ThemeConfig.neonCyan;
  static const Color textMuted = ThemeConfig.textMuted;
  static const Color textDim = ThemeConfig.textDim;

  static ThemeData get darkTheme => ThemeConfig.themeData;
}

