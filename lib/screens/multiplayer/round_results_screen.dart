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
    final players =
        (widget.data['players'] as List).cast<Map<String, dynamic>>();
    final isFinal = widget.data['isFinal'] as bool;

    final firstPlayerId = results.keys.first;
    final categoriesMap =
        results[firstPlayerId]['categories'] as Map<String, dynamic>;
    final categories = categoriesMap.keys.toList();

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text('نتائج الجولة ${widget.data['round']}',
            style: const TextStyle(
                fontFamily: 'Cairo', fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        foregroundColor: const Color(0xFF4B0082),
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
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
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.vertical,
                  padding: const EdgeInsets.all(16),
                  child: Container(
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
                    clipBehavior: Clip.antiAlias,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        headingRowColor:
                            MaterialStateProperty.all(const Color(0xFFF3E8FF)),
                        columnSpacing: 20,
                        horizontalMargin: 20,
                        columns: [
                          const DataColumn(
                              label: Text('اللاعب',
                                  style: TextStyle(
                                      fontFamily: 'Cairo',
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF4B0082)))),
                          ...categories.map((c) => DataColumn(
                              label: Text(c,
                                  style: const TextStyle(
                                      fontFamily: 'Cairo',
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF4B0082))))),
                          const DataColumn(
                              label: Text('الجولة',
                                  style: TextStyle(
                                      fontFamily: 'Cairo',
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF4B0082)))),
                          const DataColumn(
                              label: Text('المجموع',
                                  style: TextStyle(
                                      fontFamily: 'Cairo',
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF4B0082)))),
                        ],
                        rows: players.map((p) {
                          final pid = p['id'];
                          final pResult = results[pid];
                          final pCats =
                              pResult['categories'] as Map<String, dynamic>;

                          return DataRow(
                            cells: [
                              DataCell(Text(p['name'],
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Cairo'))),
                              ...categories.map((c) {
                                final cellData = pCats[c];
                                final value = cellData['value'] as String;
                                final type = cellData['type'] as String;
                                final score = cellData['score'] as int;

                                Color bg = Colors.transparent;
                                Color textColor = Colors.black87;
                                if (type == 'green') {
                                  bg = const Color(0xFF22C55E).withOpacity(0.1);
                                  textColor = const Color(0xFF15803D);
                                }
                                if (type == 'yellow') {
                                  bg = const Color(0xFFEAB308).withOpacity(0.1);
                                  textColor = const Color(0xFFA16207);
                                }
                                if (type == 'red') {
                                  bg = const Color(0xFFEF4444).withOpacity(0.1);
                                  textColor = const Color(0xFFB91C1C);
                                }

                                return DataCell(
                                  Container(
                                    width:
                                        100, // Fixed width for better alignment
                                    decoration: BoxDecoration(
                                      color: bg,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 8),
                                    margin:
                                        const EdgeInsets.symmetric(vertical: 4),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(value.isEmpty ? '-' : value,
                                            style: const TextStyle(
                                                fontFamily: 'Cairo',
                                                height: 1.2)),
                                        if (value.isNotEmpty)
                                          Text('$score نقطة',
                                              style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  fontFamily: 'Cairo',
                                                  color: textColor)),
                                      ],
                                    ),
                                  ),
                                );
                              }),
                              DataCell(Text(pResult['total'].toString(),
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Cairo',
                                      color: Color(0xFFA855F7)))),
                              DataCell(Text(p['score'].toString(),
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Cairo',
                                      color: Color(0xFF4B0082)))),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: isFinal
                      ? const Center(
                          child: Text(
                              'انتهت اللعبة! في انتظار النتائج النهائية...',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontFamily: 'Cairo',
                                  fontSize: 16,
                                  color: Colors.grey)))
                      : ElevatedButton(
                          onPressed: _nextRound,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFA855F7), // Purple
                            foregroundColor: Colors.white,
                            elevation: 5,
                            shadowColor:
                                const Color(0xFFA855F7).withOpacity(0.4),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20)),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('الجولة التالية',
                                  style: TextStyle(
                                      fontSize: 20,
                                      fontFamily: 'Cairo',
                                      fontWeight: FontWeight.bold)),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_forward_rounded)
                            ],
                          ),
                        ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
