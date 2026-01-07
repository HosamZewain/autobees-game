import 'package:flutter/material.dart';
import 'multiplayer_home_screen.dart';

class FinalSummaryScreen extends StatelessWidget {
  final String roomId;
  final Map<String, dynamic> data;

  const FinalSummaryScreen({
    super.key,
    required this.roomId,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    // data['ranking'] is list of player objects with final scores, sorted
    final ranking = (data['ranking'] as List).cast<Map<String, dynamic>>();

    return Scaffold(
      appBar: AppBar(title: const Text('انتهت اللعبة')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Icon(Icons.emoji_events, size: 80, color: Colors.amber),
            const SizedBox(height: 16),
            const Text('النتائج النهائية',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.builder(
                itemCount: ranking.length,
                itemBuilder: (context, index) {
                  final player = ranking[index];
                  final isWinner = index == 0;

                  return Card(
                    color: isWinner ? Colors.amber.shade50 : null,
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isWinner ? Colors.amber : Colors.grey,
                        foregroundColor: Colors.white,
                        child: Text('${index + 1}'),
                      ),
                      title: Text(
                        player['name'],
                        style: TextStyle(
                          fontWeight:
                              isWinner ? FontWeight.bold : FontWeight.normal,
                          fontSize: isWinner ? 20 : 16,
                        ),
                      ),
                      trailing: Text(
                        '${player['score']} pts',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: isWinner ? 20 : 16,
                          color: isWinner ? Colors.amber[800] : Colors.black,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(
                        builder: (_) => const MultiplayerHomeScreen()),
                    (route) => route.isFirst,
                  );
                },
                child: const Text('العودة للرئيسية'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
