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
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text('الجولة ${widget.initialData['currentRound']}',
            style: const TextStyle(
                fontFamily: 'Cairo', fontWeight: FontWeight.bold)),
        centerTitle: true,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.transparent,
        foregroundColor: const Color(0xFF4B0082),
        elevation: 0,
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 5),
            decoration: BoxDecoration(
              color: _timeLeft < 10
                  ? const Color(0xFFEF4444) // Red
                  : const Color(0xFFA855F7), // Purple
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: (_timeLeft < 10
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
                const Icon(Icons.timer_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 5),
                Text(
                  '$_timeLeft',
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
            colors: [Color(0xFFF3E8FF), Colors.white], // Purple tint to white
            stops: [0.0, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
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
                      _letter,
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
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final category = _categories[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 15.0),
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
                          controller: _controllers[category],
                          enabled: !_submitted,
                          textAlign: TextAlign.right,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontFamily: 'Cairo'),
                          textDirection: TextDirection.rtl,
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
                padding: const EdgeInsets.all(20.0),
                child: SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: _submitted ? null : _submitAnswers,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF22C55E), // Green
                      foregroundColor: Colors.white,
                      elevation: 5,
                      shadowColor: const Color(0xFF22C55E).withOpacity(0.4),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20)),
                      disabledBackgroundColor: Colors.grey.shade300,
                    ),
                    child: _submitted
                        ? const Text('تم الإرسال',
                            style: TextStyle(
                                fontSize: 20,
                                fontFamily: 'Cairo',
                                fontWeight: FontWeight.bold))
                        : const Text('إرسال الإجابات',
                            style: TextStyle(
                                fontSize: 20,
                                fontFamily: 'Cairo',
                                fontWeight: FontWeight.bold)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
