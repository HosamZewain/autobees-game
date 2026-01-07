class AnswerRecord {
  final String category;
  String userAnswer;
  bool isCorrect;
  int score;

  AnswerRecord({
    required this.category,
    this.userAnswer = '',
    this.isCorrect = false,
    this.score = 0,
  });
}
