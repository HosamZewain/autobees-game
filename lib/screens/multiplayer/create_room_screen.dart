import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/socket_service.dart';
import '../../models/multiplayer_models.dart';
import 'lobby_screen.dart';
import '../../utils/game_constants.dart';

class CreateRoomScreen extends StatefulWidget {
  const CreateRoomScreen({super.key});

  @override
  State<CreateRoomScreen> createState() => _CreateRoomScreenState();
}

class _CreateRoomScreenState extends State<CreateRoomScreen> {
  int _rounds = 3;
  int _timeLimit = 60;
  final Map<String, bool> _categories = {
    for (var cat in GameConstants.availableCategories) cat: true
  };
  bool _isCreating = false;

  void _createRoom() {
    final selectedCategories = _categories.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();

    if (selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى اختيار فئة واحدة على الأقل')),
      );
      return;
    }

    setState(() => _isCreating = true);

    final config = RoomConfig(
      rounds: _rounds,
      timeLimit: _timeLimit,
      categories: selectedCategories,
    );

    // For now we use a default name or ask, but let's use "Host" for simplicity or generate one
    const playerName = "Host";

    context.read<SocketService>().createRoom(config, playerName, (response) {
      setState(() => _isCreating = false);
      if (response != null && response['error'] == null) {
        final roomId = response['roomId'];
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => LobbyScreen(
                roomId: roomId, isHost: true, playerName: playerName),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في إنشاء الغرفة: ${response?['error']}')),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إنشاء غرفة')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('عدد الجولات',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Slider(
              value: _rounds.toDouble(),
              min: 1,
              max: 5,
              divisions: 4,
              label: _rounds.toString(),
              onChanged: (val) => setState(() => _rounds = val.toInt()),
            ),
            Center(child: Text('$_rounds جولات')),
            const SizedBox(height: 24),
            const Text('وقت الجولة (بالثواني)',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [30, 60, 90].map((t) {
                return ChoiceChip(
                  label: Text('$t ثانية'),
                  selected: _timeLimit == t,
                  onSelected: (selected) {
                    if (selected) setState(() => _timeLimit = t);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            const Text('الفئات',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ..._categories.keys.map((cat) {
              return CheckboxListTile(
                title: Text(cat),
                value: _categories[cat],
                onChanged: (val) =>
                    setState(() => _categories[cat] = val ?? false),
              );
            }),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isCreating ? null : _createRoom,
                style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple,
                    foregroundColor: Colors.white),
                child: _isCreating
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('إنشاء غرفة', style: TextStyle(fontSize: 18)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
