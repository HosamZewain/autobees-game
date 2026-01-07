import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/game_controller.dart';
import '../models/game_config.dart';
import '../utils/game_constants.dart';
import 'game_play_screen.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  int _selectedTime = 60;
  final Map<String, bool> _categories = {
    for (var cat in GameConstants.availableCategories) cat: true
  };

  void _startGame() {
    final selectedCats =
        _categories.entries.where((e) => e.value).map((e) => e.key).toList();

    if (selectedCats.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يجب اختيار فئة واحدة على الأقل')),
      );
      return;
    }

    final config = GameConfig(
      timeLimitSeconds: _selectedTime,
      selectedCategories: selectedCats,
    );

    context.read<GameController>().startGame(config);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const GamePlayScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إعدادات اللعبة (v2)'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'اختر الوقت:',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [30, 60, 90].map((time) {
                final isSelected = _selectedTime == time;
                return ChoiceChip(
                  label:
                      Text('$time ثانية', style: const TextStyle(fontSize: 16)),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) setState(() => _selectedTime = time);
                  },
                  selectedColor: Colors.amber,
                  backgroundColor: Colors.grey[200],
                );
              }).toList(),
            ),
            const SizedBox(height: 30),
            const Text(
              'اختر الفئات:',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            ..._categories.keys.map((cat) {
              return CheckboxListTile(
                title: Text(cat, style: const TextStyle(fontSize: 18)),
                value: _categories[cat],
                activeColor: Colors.green,
                onChanged: (val) {
                  setState(() => _categories[cat] = val ?? false);
                },
              );
            }).toList(),
            const SizedBox(height: 30),
            Center(
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _startGame,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    backgroundColor: const Color(0xFF66BB6A),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'بدء',
                    style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
