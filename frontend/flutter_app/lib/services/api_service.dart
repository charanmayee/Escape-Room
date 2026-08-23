import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/game_models.dart';

class ApiService {
  // Configurable base URL (Defaults to current host or local server)
  static String baseUrl = 'http://127.0.0.1:3000';

  static void setCustomBaseUrl(String url) {
    baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  // Generic Safe GET Request
  static Future<http.Response?> safeGet(String endpoint) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      return await http.get(uri).timeout(const Duration(seconds: 10));
    } catch (_) {
      return null;
    }
  }

  // Generic Safe POST Request
  static Future<http.Response?> safePost(String endpoint, Map<String, dynamic> body) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      return await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 15));
    } catch (_) {
      return null;
    }
  }

  // Fetch Leaderboard
  static Future<List<LeaderboardEntry>> fetchLeaderboard() async {
    final response = await safeGet('/api/leaderboard');
    if (response != null && response.statusCode == 200) {
      try {
        final data = jsonDecode(response.body);
        final list = data['leaderboard'] as List? ?? [];
        return list.map((item) => LeaderboardEntry.fromJson(item)).toList();
      } catch (_) {}
    }
    // Fallback offline curated leaderboard
    return [
      LeaderboardEntry(player: 'CyberSherlock', score: 1840, roomsCompleted: 5, timeRemaining: 520, difficulty: 'Hard', completedAt: 'Recent'),
      LeaderboardEntry(player: 'AgentCipher', score: 1680, roomsCompleted: 5, timeRemaining: 410, difficulty: 'Medium', completedAt: 'Recent'),
      LeaderboardEntry(player: 'NeoHacker', score: 1510, roomsCompleted: 5, timeRemaining: 320, difficulty: 'Medium', completedAt: 'Recent'),
    ];
  }

  // Save Score
  static Future<bool> submitScore({
    required String player,
    required int score,
    required int roomsCompleted,
    required int timeRemaining,
    required String difficulty,
  }) async {
    final response = await safePost('/api/leaderboard', {
      'player': player,
      'score': score,
      'rooms_completed': roomsCompleted,
      'time_remaining': timeRemaining,
      'difficulty': difficulty,
    });
    return response != null && response.statusCode == 200;
  }

  // Fetch Gemini AI Riddle
  static Future<RiddleQuestion> fetchAiRiddle({
    required String difficulty,
    String theme = 'Technology and Artificial Intelligence',
  }) async {
    final response = await safePost('/api/gemini/riddle', {
      'difficulty': difficulty,
      'theme': theme,
    });

    if (response != null && response.statusCode == 200) {
      try {
        final data = jsonDecode(response.body);
        if (data['riddle'] != null) {
          return RiddleQuestion.fromJson(data['riddle']);
        }
      } catch (_) {}
    }

    // Curated offline fallbacks
    if (difficulty == 'Hard') {
      return RiddleQuestion(
        question: 'I am a secret wrapped in math. Shift me by 3 and Caesar smiles; hash me with SHA and I can never return. What am I?',
        hint: 'An encryption algorithm used to protect secure data.',
        difficulty: 'Hard',
        theme: 'Cryptography',
      );
    } else if (difficulty == 'Easy') {
      return RiddleQuestion(
        question: 'I have keys but no locks. I have a space but no room. You can enter, but you cannot go outside. What am I?',
        hint: 'You use it every day to write code and type messages.',
        difficulty: 'Easy',
        theme: 'Technology',
      );
    }
    return RiddleQuestion(
      question: 'I speak without a mouth and hear without ears. In programming, I repeat whatever you tell me into the terminal. What am I?',
      hint: 'A standard shell command used in Bash to print text.',
      difficulty: 'Medium',
      theme: 'Artificial Intelligence',
    );
  }

  // Fetch Contextual AI Hint
  static Future<String> fetchAiHint({
    required String room,
    required String puzzleTitle,
    required String puzzleDetail,
  }) async {
    final response = await safePost('/api/gemini/hint', {
      'room': room,
      'puzzleTitle': puzzleTitle,
      'puzzleDetail': puzzleDetail,
    });

    if (response != null && response.statusCode == 200) {
      try {
        final data = jsonDecode(response.body);
        if (data['hint'] != null) {
          return data['hint'].toString();
        }
      } catch (_) {}
    }
    return 'Examine the clues carefully and combine the key letters or mathematical patterns!';
  }

  // Verify Puzzle Answer Securely on Backend
  static Future<bool> verifyPuzzleAnswer({
    required dynamic room,
    required String puzzleId,
    required String answer,
  }) async {
    final response = await safePost('/api/puzzles/verify', {
      'room': room,
      'puzzleId': puzzleId,
      'answer': answer,
    });

    if (response != null && response.statusCode == 200) {
      try {
        final data = jsonDecode(response.body);
        return data['correct'] == true;
      } catch (_) {}
    }

    // Client-side fallback validator if backend offline
    return _localFallbackVerify(room, puzzleId, answer);
  }

  static bool _localFallbackVerify(dynamic room, String puzzleId, String rawAnswer) {
    final ans = rawAnswer.trim().toUpperCase();
    if (room == 1) {
      final map = {'w1': 'PYTHON', 'w2': 'COLLEGE', 'w3': 'STUDENT', 'w4': 'PROJECT', 'w5': 'CODING', 'door': 'PCSPC'};
      return map[puzzleId] == ans;
    } else if (room == 2) {
      final map = {'d1': 'CAMPUS', 'd2': 'LIBRARY', 'd3': 'ALGORITHM', 'd4': 'DATABASE', 'd5': 'SEMESTER', 'door': 'ESCAPE2026'};
      return map[puzzleId] == ans;
    } else if (room == 4) {
      if (puzzleId == 'r1') return ans.contains('TRICYCLE');
      if (puzzleId == 'r2') return ans.contains('MAN OVERBOARD');
      if (puzzleId == 'r3') return ans.contains('FORGET IT');
      if (puzzleId == 'r4') return ans.contains('NEON LIGHT');
      if (puzzleId == 'safe') return ans == '4827';
    } else if (room == 5) {
      if (puzzleId == 'match') return ans.replaceAll(' ', '') == '0+4=4' || ans.replaceAll(' ', '') == '8-4=4';
      if (puzzleId == 'sequence') return ans == '21';
    } else if (room == 'bonus') {
      if (puzzleId == 'color') return ans.replaceAll(' ', '') == 'CYAN,AMBER,ROSE,EMERALD';
      if (puzzleId == 'spot') return ans == 'DIF3' || ans == '3';
    }
    return false;
  }
}
