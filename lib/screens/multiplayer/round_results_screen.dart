import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/socket_service.dart';
import 'multiplayer_game_screen.dart';
import 'final_summary_screen.dart';

class RoundResultsScreen extends StatefulWidget {
  final String roomId;
  final Map<String, dynamic> data;

  const RoundResultsScreen({
    super.key,
    required this.roomId,
    required this.data,
  });

  @override
  State<RoundResultsScreen> createState() => _RoundResultsScreenState();
}

class _RoundResultsScreenState extends State<RoundResultsScreen> {
  @override
  void initState() {
    super.initState();
    final socketService = context.read<SocketService>();

    socketService.gameStartedStream.listen((data) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => MultiplayerGameScreen(
              roomId: widget.roomId,
              initialData: data,
            ),
          ),
        );
      }
    });

    socketService.gameFinishedStream.listen((data) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => FinalSummaryScreen(
              roomId: widget.roomId,
              data: data,
            ),
          ),
        );
      }
    });
  }

  void _nextRound() {
    context.read<SocketService>().nextRound(widget.roomId);
  }

  @override
  Widget build(BuildContext context) {
    final results = widget.data['results'] as Map<String, dynamic>;
    final players = (widget.data['players'] as List)
        .cast<Map<String, dynamic>>(); // Adjust based on dynamic input
    final isFinal = widget.data['isFinal'] as bool;

    // We need to pivot the data for the table
    // Header: Player Name | Cat 1 | Cat 2 ... | Round Score | Total

    // Extract categories safely from first player's result
    // results map: playerId -> { categories: { cat: { value, score, type } }, total: x }
    final firstPlayerId = results.keys.first;
    final categoriesMap =
        results[firstPlayerId]['categories'] as Map<String, dynamic>;
    final categories = categoriesMap.keys.toList();

    return Scaffold(
      appBar: AppBar(title: Text('نتائج الجولة ${widget.data['round']}')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columns: [
                    const DataColumn(label: Text('اللاعب')),
                    ...categories.map((c) => DataColumn(label: Text(c))),
                    const DataColumn(label: Text('مجموع الجولة')),
                    const DataColumn(label: Text('المجموع الكلي')),
                  ],
                  rows: players.map((p) {
                    final pid = p['id'];
                    final pResult = results[pid];
                    final pCats = pResult['categories'] as Map<String, dynamic>;

                    return DataRow(
                      cells: [
                        DataCell(Text(p['name'],
                            style:
                                const TextStyle(fontWeight: FontWeight.bold))),
                        ...categories.map((c) {
                          final cellData = pCats[c];
                          final value = cellData['value'] as String;
                          final type = cellData['type'] as String;
                          final score = cellData['score'] as int;

                          Color bg = Colors.transparent;
                          if (type == 'green') bg = Colors.green.shade100;
                          if (type == 'yellow') bg = Colors.amber.shade100;
                          if (type == 'red') bg = Colors.red.shade100;

                          return DataCell(
                            Container(
                              color: bg,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(value.isEmpty ? '-' : value),
                                  Text('$score نقطة',
                                      style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.grey[700])),
                                ],
                              ),
                            ),
                          );
                        }),
                        DataCell(Text(pResult['total'].toString(),
                            style:
                                const TextStyle(fontWeight: FontWeight.bold))),
                        DataCell(Text(p['score'].toString(),
                            style:
                                const TextStyle(fontWeight: FontWeight.bold))),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: isFinal
                  ? const Text('انتهت اللعبة! في انتظار النتائج النهائية...',
                      textAlign: TextAlign.center)
                  : ElevatedButton(
                      onPressed:
                          _nextRound, // Only host should really see this? Or anyone can trigger?
                      // Logic: Host only. We don't have isHost here easily unless passed.
                      // Ideally backend checks. UI: show "Waiting for host" if not host.
                      // For MVP, let anyone click or just assume Host is driving visually.
                      // Let's modify to show "Next Round" always for now, backend will block if not owner.
                      child: const Text('الجولة التالية'),
                    ),
            ),
          )
        ],
      ),
    );
  }
}
