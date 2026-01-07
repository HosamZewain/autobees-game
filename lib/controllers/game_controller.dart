import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/game_config.dart';
import '../models/answer_record.dart';
import '../utils/game_constants.dart';
import '../services/auth_service.dart';

class GameController extends ChangeNotifier {
  GameConfig? _config;
  String _currentLetter = '';
  int _remainingTime = 0;
  Timer? _timer;
  bool _isPlaying = false;
  bool _isValidating = false;
  final AuthService _authService;

  GameController(this._authService);

  Map<String, AnswerRecord> _answers = {};

  // Getters
  GameConfig? get config => _config;
  String get currentLetter => _currentLetter;
  int get remainingTime => _remainingTime;
  bool get isPlaying => _isPlaying;
  bool get isValidating => _isValidating;
  Map<String, AnswerRecord> get answers => _answers;

  int get totalScore =>
      _answers.values.fold(0, (sum, record) => sum + record.score);

  void startGame(GameConfig config) {
    _config = config;
    _generateRandomLetter();
    _remainingTime = config.timeLimitSeconds;
    _isPlaying = true;

    // Initialize empty answers
    _answers = {};
    for (var category in config.selectedCategories) {
      _answers[category] = AnswerRecord(category: category);
    }

    notifyListeners();
    _startTimer();
  }

  void _generateRandomLetter() {
    // If config has a fixed letter (for debug), use it.
    if (_config?.fixedLetter != null && _config!.fixedLetter!.isNotEmpty) {
      _currentLetter = _config!.fixedLetter!;
    } else {
      final random = Random();
      _currentLetter = GameConstants
          .validLetters[random.nextInt(GameConstants.validLetters.length)];
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingTime > 0) {
        _remainingTime--;
        notifyListeners();
      } else {
        finishGame();
      }
    });
  }

  void updateAnswer(String category, String value) {
    if (_answers.containsKey(category)) {
      _answers[category]!.userAnswer = value;
      notifyListeners();
    }
  }

  Future<void> finishGame() async {
    _timer?.cancel();
    _isPlaying = false; // Set playing to false immediately
    await _calculateFinalScores(); // Call the new method to handle validation and logging
    notifyListeners();
  }

  Future<void> _calculateFinalScores() async {
    _isValidating = true;
    notifyListeners();

    await _validateAnswers(); // Use the existing _validateAnswers method

    // Log to backend if logged in
    final token = _authService.token; // Use the existing token getter
    if (token != null) {
      try {
        final totalScore =
            answers.values.fold(0, (sum, record) => sum + record.score);
        final details = {
          'players': [
            {'name': 'You', 'score': totalScore}
          ],
          'config': {
            'letter': _currentLetter,
          },
          'scores': {'solo': totalScore}
        };

        final url = Uri.parse(
            '${AuthService.baseUrl.replaceAll('/api/auth', '')}/api/matches/log');
        print('Logging game to: $url');
        final response = await http.post(
          url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: json.encode({'details': details}),
        );
        print('Log game response status: ${response.statusCode}');
        if (response.statusCode != 200) {
          print('Log game error: ${response.body}');
        }
      } catch (e) {
        print('Failed to log solo game: $e');
      }
    }

    _isValidating = false;
    notifyListeners();
  }

  Future<void> _validateAnswers() async {
    final token = _authService.token;
    final baseUrl =
        AuthService.baseUrl.replaceAll('/api/auth', '/api/dictionary/validate');

    for (var entry in _answers.entries) {
      final record = entry.value;
      final input = record.userAnswer.trim();

      if (input.isEmpty) {
        record.isCorrect = false;
        record.score = 0;
        continue;
      }

      // 1. Basic check first to save API calls
      if (!input.startsWith(_currentLetter)) {
        record.isCorrect = false;
        record.score = 0;
        continue;
      }

      // 2. API Call for dictionary check
      try {
        final response = await http.post(
          Uri.parse(baseUrl),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: json.encode({
            'word': input,
            'category': record.category,
            'letter': _currentLetter,
          }),
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          if (data['isValid'] == true) {
            record.isCorrect = true;
            record.score = 10;
          } else {
            record.isCorrect = false;
            record.score = 0;
          }
        } else {
          // If server error, mark as incorrect to be safe
          print('Server validation failed with status: ${response.statusCode}');
          record.isCorrect = false;
          record.score = 0;
        }
      } catch (e) {
        print('Validation error for ${record.category}: $e');
        record.isCorrect = false;
        record.score = 0;
      }
    }
  }

  void resetGame() {
    _timer?.cancel();
    _isPlaying = false;
    _currentLetter = '';
    _remainingTime = 0;
    _answers = {};
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
