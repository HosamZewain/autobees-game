import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/game_controller.dart';
import 'results_screen.dart';

class GamePlayScreen extends StatefulWidget {
  const GamePlayScreen({super.key});

  @override
  State<GamePlayScreen> createState() => _GamePlayScreenState();
}

class _GamePlayScreenState extends State<GamePlayScreen> {
  late GameController _controller;

  @override
  void initState() {
    super.initState();
    _controller = context.read<GameController>();
    _controller.addListener(_checkGameEnd);
  }

  void _checkGameEnd() {
    if (!_controller.isPlaying) {
      // Navigate to results when game ends (e.g. timeout)
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const ResultsScreen()),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_checkGameEnd);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, child) {
        if (!controller.isPlaying) {
          // Fallback if accessed incorrectly
          return const Scaffold(
              body: Center(child: CircularProgressIndicator()));
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text('اللعب'),
            centerTitle: true,
            automaticallyImplyLeading: false, // Prevent back button during game
            actions: [
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                padding: const EdgeInsets.symmetric(horizontal: 15),
                decoration: BoxDecoration(
                  color: controller.remainingTime < 10
                      ? Colors.redAccent
                      : Colors.amberAccent,
                  borderRadius: BorderRadius.circular(20),
                ),
                alignment: Alignment.center,
                child: Text(
                  '${controller.remainingTime}',
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white),
                ),
              )
            ],
          ),
          body: Column(
            children: [
              // Header: Letter
              Container(
                width: double.infinity,
                color: Colors.amber.shade100,
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Column(
                  children: [
                    const Text('حرف',
                        style: TextStyle(fontSize: 18, color: Colors.brown)),
                    Text(
                      controller.currentLetter,
                      style: const TextStyle(
                          fontSize: 80,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF5D4037)),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: controller.config?.selectedCategories.length ?? 0,
                  itemBuilder: (context, index) {
                    final category =
                        controller.config!.selectedCategories[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 15),
                      child: TextField(
                        onChanged: (val) {
                          controller.updateAnswer(category, val);
                        },
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          labelText: category,
                          labelStyle: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.white,
                        ),
                      ),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: controller.isValidating
                        ? null
                        : () async {
                            await controller.finishGame();
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: controller.isValidating
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'إنهاء الجولة',
                            style: TextStyle(
                                fontSize: 20,
                                color: Colors.white,
                                fontFamily: 'Cairo'),
                          ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
