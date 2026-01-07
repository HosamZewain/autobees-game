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
      appBar: AppBar(
        title: const Text('إنشاء غرفة',
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
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('عدد الجولات',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'Cairo',
                        color: Color(0xFF4B0082))),
                const SizedBox(height: 10),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 20),
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
                    children: [
                      SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          activeTrackColor: const Color(0xFFA855F7),
                          inactiveTrackColor: Colors.purple.shade100,
                          thumbColor: const Color(0xFF4B0082),
                          overlayColor: Colors.purple.withOpacity(0.2),
                          valueIndicatorColor: const Color(0xFFA855F7),
                          valueIndicatorTextStyle: const TextStyle(
                              color: Colors.white, fontFamily: 'Cairo'),
                        ),
                        child: Slider(
                          value: _rounds.toDouble(),
                          min: 1,
                          max: 5,
                          divisions: 4,
                          label: _rounds.toString(),
                          onChanged: (val) =>
                              setState(() => _rounds = val.toInt()),
                        ),
                      ),
                      Text('$_rounds جولات',
                          style: const TextStyle(
                              fontFamily: 'Cairo',
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF4B5563))),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('وقت الجولة (بالثواني)',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'Cairo',
                        color: Color(0xFF4B0082))),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [30, 60, 90].map((t) {
                    final isSelected = _timeLimit == t;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      child: ChoiceChip(
                        label: Text('$t ثانية',
                            style: TextStyle(
                                fontFamily: 'Cairo',
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? Colors.white
                                    : Colors.grey[600])),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) setState(() => _timeLimit = t);
                        },
                        selectedColor: const Color(0xFFA855F7), // Purple
                        backgroundColor: Colors.white,
                        elevation: isSelected ? 4 : 1,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        side: BorderSide(
                          color: isSelected
                              ? Colors.transparent
                              : Colors.grey[300]!,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                const Text('الفئات',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'Cairo',
                        color: Color(0xFF4B0082))),
                const SizedBox(height: 10),
                Container(
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
                                fontFamily: 'Cairo',
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF4B5563))),
                        value: _categories[cat],
                        activeColor: const Color(0xFF22C55E), // Green
                        checkboxShape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4)),
                        onChanged: (val) =>
                            setState(() => _categories[cat] = val ?? false),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: _isCreating ? null : _createRoom,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFA855F7),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      elevation: 5,
                      shadowColor: const Color(0xFFA855F7).withOpacity(0.4),
                    ),
                    child: _isCreating
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('إنشاء غرفة',
                            style: TextStyle(
                                fontSize: 20,
                                fontFamily: 'Cairo',
                                fontWeight: FontWeight.bold)),
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
