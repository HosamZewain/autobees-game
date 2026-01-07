import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/socket_service.dart';
import 'round_results_screen.dart';

class MultiplayerGameScreen extends StatefulWidget {
  final String roomId;
  final Map<String, dynamic> initialData;

  const MultiplayerGameScreen({
    super.key,
    required this.roomId,
    required this.initialData,
  });

  @override
  State<MultiplayerGameScreen> createState() => _MultiplayerGameScreenState();
}

class _MultiplayerGameScreenState extends State<MultiplayerGameScreen> {
  late String _letter;
  late List<String> _categories;
  late int _timeLeft;
  Timer? _timer;
  final Map<String, TextEditingController> _controllers = {};
  bool _submitted = false;

  @override
  void initState() {
    super.initState();
    _letter = widget.initialData['letter'];
    _categories = List<String>.from(widget.initialData['categories']);
    _timeLeft = widget.initialData['timeLimit'];

    for (var cat in _categories) {
      _controllers[cat] = TextEditingController();
    }

    _startTimer();

    // Listen for results
    context.read<SocketService>().roundResultsStream.listen((data) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => RoundResultsScreen(
              roomId: widget.roomId,
              data: data,
            ),
          ),
        );
      }
    });
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 0) {
        setState(() {
          _timeLeft--;
        });
      } else {
        _submitAnswers();
      }
    });
  }

  void _submitAnswers() {
    if (_submitted) return;

    _timer?.cancel();
    setState(() => _submitted = true);

    final answers = <String, String>{};
    _controllers.forEach((key, value) {
      answers[key] = value.text.trim();
    });

    context.read<SocketService>().submitAnswers(widget.roomId, answers);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controllers.values.forEach((c) => c.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('الجولة ${widget.initialData['currentRound']}'),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                '$_timeLeft ثانية',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: _timeLeft < 10 ? Colors.red : Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.amber.shade100,
            width: double.infinity,
            child: Column(
              children: [
                const Text('حرف', style: TextStyle(fontSize: 16)),
                Text(
                  _letter,
                  style: const TextStyle(
                      fontSize: 48, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: TextField(
                    controller: _controllers[category],
                    enabled: !_submitted,
                    textDirection: TextDirection.rtl,
                    decoration: InputDecoration(
                      labelText: category,
                      border: const OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _submitted ? null : _submitAnswers,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: const Text('إرسال الإجابات',
                    style: TextStyle(fontSize: 20)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
