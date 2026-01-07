class GameConfig {
  final int timeLimitSeconds;
  final List<String> selectedCategories;
  final String? fixedLetter; // Optional, strict random by default

  GameConfig({
    required this.timeLimitSeconds,
    required this.selectedCategories,
    this.fixedLetter,
  });
}
