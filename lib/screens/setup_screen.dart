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
        title: const Text('إعدادات اللعبة',
            style: TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        foregroundColor: const Color(0xFF4B0082), // Deep Purple
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment(0, -0.6),
            radius: 0.8,
            colors: [Color(0xFFF3E8FF), Colors.white], // Purple tint to white
            stops: [0.0, 1.0],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'اختر الوقت:',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF4B0082),
                      fontFamily: 'Cairo'),
                ),
                const SizedBox(height: 15),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [30, 60, 90].map((time) {
                    final isSelected = _selectedTime == time;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      child: ChoiceChip(
                        label: Text('$time ثانية',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? Colors.white
                                    : Colors.grey[600],
                                fontFamily: 'Cairo')),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) setState(() => _selectedTime = time);
                        },
                        selectedColor: const Color(0xFFA855F7), // Purple
                        backgroundColor: Colors.white,
                        elevation: isSelected ? 5 : 1,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 15, vertical: 10),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                        side: BorderSide(
                          color: isSelected
                              ? Colors.transparent
                              : Colors.grey[300]!,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 30),
                const Text(
                  'اختر الفئات:',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF4B0082),
                      fontFamily: 'Cairo'),
                ),
                const SizedBox(height: 15),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFA855F7).withOpacity(0.05),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      )
                    ],
                    border: Border.all(color: const Color(0xFFF3E8FF)),
                  ),
                  child: Column(
                    children: _categories.keys.map((cat) {
                      return CheckboxListTile(
                        title: Text(cat,
                            style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Cairo',
                                color: Color(0xFF4B5563))),
                        value: _categories[cat],
                        activeColor: const Color(0xFF22C55E), // Green
                        checkColor: Colors.white,
                        checkboxShape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(5)),
                        onChanged: (val) {
                          setState(() => _categories[cat] = val ?? false);
                        },
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 40),
                Center(
                  child: Container(
                    width: double.infinity,
                    height: 65,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF4ADE80),
                          Color(0xFF22C55E)
                        ], // Green Gradient
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF22C55E).withOpacity(0.3),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        )
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: _startGame,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.play_circle_fill,
                              color: Colors.white, size: 32),
                          SizedBox(width: 10),
                          Text(
                            'بدء اللعب',
                            style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                fontFamily: 'Cairo'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
