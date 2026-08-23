enum Difficulty {
  easy,
  medium,
  hard,
}

extension DifficultyExtension on Difficulty {
  String get label {
    switch (this) {
      case Difficulty.easy:
        return 'Easy';
      case Difficulty.medium:
        return 'Medium';
      case Difficulty.hard:
        return 'Hard';
    }
  }

  int get timerSeconds {
    switch (this) {
      case Difficulty.easy:
        return 1200; // 20 mins
      case Difficulty.medium:
        return 900; // 15 mins
      case Difficulty.hard:
        return 600; // 10 mins
    }
  }

  int get startingHints {
    switch (this) {
      case Difficulty.easy:
        return 5;
      case Difficulty.medium:
        return 3;
      case Difficulty.hard:
        return 1;
    }
  }

  int get startingLives {
    switch (this) {
      case Difficulty.easy:
        return 3;
      case Difficulty.medium:
        return 3;
      case Difficulty.hard:
        return 2;
    }
  }

  double get scoreMultiplier {
    switch (this) {
      case Difficulty.easy:
        return 1.0;
      case Difficulty.medium:
        return 1.5;
      case Difficulty.hard:
        return 2.0;
    }
  }
}

class ClueItem {
  final String id;
  final String title;
  final String icon;
  final String description;
  final DateTime discoveredAt;

  ClueItem({
    required this.id,
    required this.title,
    required this.icon,
    required this.description,
    DateTime? discoveredAt,
  }) : discoveredAt = discoveredAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'icon': icon,
    'description': description,
    'discoveredAt': discoveredAt.toIso8601String(),
  };

  factory ClueItem.fromJson(Map<String, dynamic> json) => ClueItem(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    icon: json['icon'] ?? '🗝',
    description: json['description'] ?? '',
    discoveredAt: json['discoveredAt'] != null
        ? DateTime.tryParse(json['discoveredAt'])
        : null,
  );
}

class LeaderboardEntry {
  final String player;
  final int score;
  final int roomsCompleted;
  final int timeRemaining;
  final String difficulty;
  final String completedAt;

  LeaderboardEntry({
    required this.player,
    required this.score,
    required this.roomsCompleted,
    required this.timeRemaining,
    required this.difficulty,
    required this.completedAt,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      player: json['player'] ?? 'Unknown Agent',
      score: json['score'] ?? 0,
      roomsCompleted: json['rooms_completed'] ?? 0,
      timeRemaining: json['time_remaining'] ?? 0,
      difficulty: json['difficulty'] ?? 'Medium',
      completedAt: json['completed_at'] ?? 'N/A',
    );
  }
}

class RiddleQuestion {
  final String question;
  final String hint;
  final String difficulty;
  final String theme;

  RiddleQuestion({
    required this.question,
    required this.hint,
    required this.difficulty,
    required this.theme,
  });

  factory RiddleQuestion.fromJson(Map<String, dynamic> json) {
    return RiddleQuestion(
      question: json['question'] ?? 'Riddle incoming...',
      hint: json['hint'] ?? 'Inspect patterns carefully.',
      difficulty: json['difficulty'] ?? 'Medium',
      theme: json['theme'] ?? 'Technology',
    );
  }
}
