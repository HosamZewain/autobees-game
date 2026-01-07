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
              body: Center(
                  child: CircularProgressIndicator(color: Color(0xFFA855F7))));
        }

        return Scaffold(
          extendBodyBehindAppBar: true,
          appBar: AppBar(
            title: const Text('اللعب',
                style: TextStyle(
                    fontFamily: 'Cairo', fontWeight: FontWeight.bold)),
            centerTitle: true,
            automaticallyImplyLeading: false, // Prevent back button during game
            backgroundColor: Colors.transparent,
            foregroundColor: const Color(0xFF4B0082),
            elevation: 0,
            actions: [
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 15, vertical: 5),
                decoration: BoxDecoration(
                  color: controller.remainingTime < 10
                      ? const Color(0xFFEF4444) // Red
                      : const Color(0xFFA855F7), // Purple
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: (controller.remainingTime < 10
                              ? const Color(0xFFEF4444)
                              : const Color(0xFFA855F7))
                          .withOpacity(0.4),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                alignment: Alignment.center,
                child: Row(
                  children: [
                    const Icon(Icons.timer_rounded,
                        color: Colors.white, size: 20),
                    const SizedBox(width: 5),
                    Text(
                      '${controller.remainingTime}',
                      style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontFamily: 'Cairo'),
                    ),
                  ],
                ),
              )
            ],
          ),
          body: Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(0, -0.6),
                radius: 0.8,
                colors: [
                  Color(0xFFF3E8FF),
                  Colors.white
                ], // Purple tint to white
                stops: [0.0, 1.0],
              ),
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // Header: Letter
                  Container(
                    margin: const EdgeInsets.all(16),
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFA855F7).withOpacity(0.1),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        )
                      ],
                      border: Border.all(color: const Color(0xFFF3E8FF)),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Column(
                      children: [
                        const Text('حرف',
                            style: TextStyle(
                                fontSize: 18,
                                color: Color(0xFF6B7280),
                                fontFamily: 'Cairo',
                                fontWeight: FontWeight.bold)),
                        Text(
                          controller.currentLetter,
                          style: const TextStyle(
                              fontSize: 80,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF4B0082), // Deep Purple
                              fontFamily: 'Cairo'),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount:
                          controller.config?.selectedCategories.length ?? 0,
                      itemBuilder: (context, index) {
                        final category =
                            controller.config!.selectedCategories[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 15),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              boxShadow: [
                                BoxShadow(
                                    color: Colors.black.withOpacity(0.03),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3))
                              ],
                            ),
                            child: TextField(
                              onChanged: (val) {
                                controller.updateAnswer(category, val);
                              },
                              textAlign: TextAlign.right,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Cairo'),
                              textInputAction: TextInputAction.next,
                              decoration: InputDecoration(
                                labelText: category,
                                labelStyle: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'Cairo',
                                    color: Colors.grey),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 20, vertical: 15),
                                filled: true,
                                fillColor: Colors.transparent,
                                prefixIcon: const Icon(Icons.edit_rounded,
                                    color: Color(0xFFA855F7), size: 20),
                              ),
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
                      height: 60,
                      child: ElevatedButton(
                        onPressed: controller.isValidating
                            ? null
                            : () async {
                                await controller.finishGame();
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20)),
                        ),
                        child: Ink(
                          decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFFEF4444),
                                  Color(0xFFDC2626)
                                ], // Red Gradient
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                    color: const Color(0xFFEF4444)
                                        .withOpacity(0.3),
                                    blurRadius: 10,
                                    offset: const Offset(0, 5))
                              ]),
                          child: Container(
                            alignment: Alignment.center,
                            child: controller.isValidating
                                ? const CircularProgressIndicator(
                                    color: Colors.white)
                                : const Text(
                                    'إنهاء الجولة',
                                    style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                        fontFamily: 'Cairo'),
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
