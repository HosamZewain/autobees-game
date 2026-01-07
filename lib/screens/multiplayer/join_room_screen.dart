import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/socket_service.dart';
import 'lobby_screen.dart';

class JoinRoomScreen extends StatefulWidget {
  const JoinRoomScreen({super.key});

  @override
  State<JoinRoomScreen> createState() => _JoinRoomScreenState();
}

class _JoinRoomScreenState extends State<JoinRoomScreen> {
  final _codeController = TextEditingController();
  final _nameController = TextEditingController();
  bool _isJoining = false;

  void _joinRoom() {
    final roomId = _codeController.text.trim().toUpperCase();
    final name = _nameController.text.trim();

    if (roomId.isEmpty || name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال رمز الغرفة واسمك')),
      );
      return;
    }

    setState(() => _isJoining = true);

    context.read<SocketService>().joinRoom(roomId, name, (response) {
      setState(() => _isJoining = false);
      if (response != null && response['error'] == null) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) =>
                LobbyScreen(roomId: roomId, isHost: false, playerName: name),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  'خطأ في الانضمام للغرفة: ${response?['error'] ?? "Unknown"}')),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('انضمام لغرفة',
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
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                          color: const Color(0xFFA855F7).withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4))
                    ],
                    border: Border.all(color: const Color(0xFFF3E8FF)),
                  ),
                  child: TextField(
                    controller: _nameController,
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                        fontFamily: 'Cairo', fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      labelText: 'اسمك',
                      labelStyle: TextStyle(
                          color: Colors.grey[400], fontFamily: 'Cairo'),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 15),
                      prefixIcon: const Icon(Icons.person_rounded,
                          color: Color(0xFFA855F7)), // Purple
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                          color: const Color(0xFFA855F7).withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4))
                    ],
                    border: Border.all(color: const Color(0xFFF3E8FF)),
                  ),
                  child: TextField(
                    controller: _codeController,
                    textCapitalization: TextCapitalization.characters,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        fontFamily: 'Cairo',
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2),
                    decoration: InputDecoration(
                      labelText: 'رمز الغرفة (4 أحرف)',
                      labelStyle: TextStyle(
                          color: Colors.grey[400], fontFamily: 'Cairo'),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 15),
                      prefixIcon: const Icon(Icons.key_rounded,
                          color: Color(0xFFA855F7)), // Purple
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: _isJoining ? null : _joinRoom,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF22C55E), // Green
                      foregroundColor: Colors.white,
                      elevation: 5,
                      shadowColor: const Color(0xFF22C55E).withOpacity(0.4),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20)),
                    ),
                    child: _isJoining
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('انضمام',
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
