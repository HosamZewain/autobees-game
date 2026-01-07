import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/game_controller.dart';
import 'home_screen.dart';
import 'game_play_screen.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Access controller without listening continuously for everything, 
    // but we need the data once.
    final controller = context.read<GameController>();
    final answers = controller.answers;
    final totalScore = controller.totalScore;

    return Scaffold(
      appBar: AppBar(
        title: const Text('النتائج'),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20),
            color: Colors.amber.shade50,
            child: Column(
              children: [
                const Text('مجمـــــوع النقــــاط', style: TextStyle(fontSize: 18)),
                Text(
                  '$totalScore',
                  style: const TextStyle(fontSize: 60, fontWeight: FontWeight.bold, color: Colors.green),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              itemCount: answers.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final key = answers.keys.elementAt(index);
                final record = answers[key]!;
                
                return ListTile(
                  title: Text(record.category, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(
                    record.userAnswer.isEmpty ? '---' : record.userAnswer,
                    style: TextStyle(
                      fontSize: 18,
                      color: record.userAnswer.isEmpty ? Colors.grey : Colors.black87
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: record.isCorrect ? Colors.green.shade100 : Colors.red.shade100,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: record.isCorrect ? Colors.green : Colors.red
                      ),
                    ),
                    child: Text(
                      '${record.score}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: record.isCorrect ? Colors.green.shade800 : Colors.red.shade800,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      controller.resetGame();
                      Navigator.pushAndRemoveUntil(
                          context, 
                          MaterialPageRoute(builder: (_) => const HomeScreen()), 
                          (route) => false
                      );
                    },
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 15)),
                    child: const Text('الرئيسية'),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      // Restart with same config
                      final config = controller.config;
                      if (config != null) {
                        controller.resetGame();
                        controller.startGame(config);
                         Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (context) => const GamePlayScreen()),
                          );
                      } else {
                        // Fallback
                         Navigator.pushAndRemoveUntil(
                          context, 
                          MaterialPageRoute(builder: (_) => const HomeScreen()), 
                          (route) => false
                      );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber, 
                      padding: const EdgeInsets.symmetric(vertical: 15)
                    ),
                    child: const Text('لعب مجدداً'),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
