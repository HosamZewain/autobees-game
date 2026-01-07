import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/socket_service.dart';
import '../../models/multiplayer_models.dart';
import 'multiplayer_game_screen.dart';

class LobbyScreen extends StatefulWidget {
  final String roomId;
  final bool isHost;
  final String playerName;

  const LobbyScreen({
    super.key,
    required this.roomId,
    required this.isHost,
    required this.playerName,
  });

  @override
  State<LobbyScreen> createState() => _LobbyScreenState();
}

class _LobbyScreenState extends State<LobbyScreen> {
  List<MultiplayerPlayer> _players = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    final socketService = context.read<SocketService>();

    // Initial listener for player updates
    socketService.roomStream.listen((room) {
      if (room.roomId == widget.roomId) {
        if (mounted) {
          setState(() {
            _players = room.players;
            _isLoading = false;
          });
        }
      }
    });

    // Listener for game start
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

    // Add ourselves initially if we just joined (optimistic or wait for update)
    // Actually the initial callback in Join/Create should potentially have given us the list.
    // For now, we rely on the socket update which fires immediately on join on the server.
  }

  void _startGame() {
    context.read<SocketService>().startGame(widget.roomId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('غرفة: ${widget.roomId}',
            style: const TextStyle(
                fontFamily: 'Cairo', fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        foregroundColor: const Color(0xFF4B0082), // Deep Purple
        elevation: 0,
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
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFF3E8FF)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFA855F7).withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      const Text('رمز الغرفة',
                          style: TextStyle(
                              fontSize: 14,
                              fontFamily: 'Cairo',
                              color: Colors.grey)),
                      const SizedBox(height: 8),
                      SelectableText(
                        widget.roomId,
                        style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 4,
                            color: Color(0xFF4B0082), // Deep Purple
                            fontFamily: 'Cairo'),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                            color: const Color(0xFFF3E8FF),
                            borderRadius: BorderRadius.circular(20)),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.copy_rounded,
                                size: 14, color: Color(0xFFA855F7)),
                            SizedBox(width: 5),
                            Text('شارك هذا الرمز مع أصدقائك!',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFFA855F7),
                                    fontFamily: 'Cairo',
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                const Align(
                  alignment: Alignment.centerRight,
                  child: Text('اللاعبين',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'Cairo',
                          color: Color(0xFF4B0082))),
                ),
                const SizedBox(height: 15),
                Expanded(
                  child: _isLoading && _players.isEmpty
                      ? const Center(child: CircularProgressIndicator())
                      : ListView.builder(
                          itemCount: _players.length,
                          itemBuilder: (context, index) {
                            final player = _players[index];
                            final isMe = player.name == widget.playerName;
                            return Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(15),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.03),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    )
                                  ]),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: isMe
                                      ? const Color(0xFF22C55E)
                                      : const Color(
                                          0xFFA855F7), // Green for me, Purple for others
                                  child: Text(
                                      player.name.substring(0, 1).toUpperCase(),
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold)),
                                ),
                                title: Text(player.name,
                                    style: const TextStyle(
                                        fontFamily: 'Cairo',
                                        fontWeight: FontWeight.bold)),
                                trailing: isMe
                                    ? Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                            color: const Color(
                                                0xFFDCFCE7), // Light Green
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                        child: const Text('أنت',
                                            style: TextStyle(
                                                color: Color(0xFF166534),
                                                fontFamily: 'Cairo',
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold)),
                                      )
                                    : null,
                              ),
                            );
                          },
                        ),
                ),
                const SizedBox(height: 24),
                if (widget.isHost)
                  Container(
                    width: double.infinity,
                    height: 60,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: _players.isNotEmpty
                          ? const LinearGradient(
                              colors: [Color(0xFF4ADE80), Color(0xFF22C55E)])
                          : null,
                      color: _players.isEmpty ? Colors.grey : null,
                      boxShadow: _players.isNotEmpty
                          ? [
                              BoxShadow(
                                color: const Color(0xFF22C55E).withOpacity(0.3),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              )
                            ]
                          : [],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: _players.isNotEmpty ? _startGame : null,
                      icon: const Icon(Icons.play_arrow_rounded,
                          size: 30, color: Colors.white),
                      label: const Text('بدء اللعبة',
                          style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Cairo',
                              color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                      ),
                    ),
                  )
                else
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        const CircularProgressIndicator(
                            color: Color(0xFFA855F7)),
                        const SizedBox(height: 15),
                        Text('في انتظار المضيف لبدء اللعبة...',
                            style: TextStyle(
                                fontSize: 16,
                                fontFamily: 'Cairo',
                                color: Colors.grey[600],
                                fontWeight: FontWeight.bold)),
                      ],
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
