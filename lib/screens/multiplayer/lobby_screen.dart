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
        title: Text('غرفة: ${widget.roomId}'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.shade100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber),
              ),
              child: Column(
                children: [
                  const Text('رمز الغرفة', style: TextStyle(fontSize: 14)),
                  const SizedBox(height: 4),
                  Text(
                    widget.roomId,
                    style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4),
                  ),
                  const SizedBox(height: 4),
                  const Text('شارك هذا الرمز مع أصدقائك!',
                      style:
                          TextStyle(fontSize: 12, fontStyle: FontStyle.italic)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('اللاعبين',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Expanded(
              child: _isLoading && _players.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: _players.length,
                      itemBuilder: (context, index) {
                        final player = _players[index];
                        return Card(
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Colors.purple,
                              child: Text(
                                  player.name.substring(0, 1).toUpperCase(),
                                  style: const TextStyle(color: Colors.white)),
                            ),
                            title: Text(player.name),
                            trailing: player.name == widget.playerName
                                ? const Chip(label: Text('أنت'))
                                : null,
                          ),
                        );
                      },
                    ),
            ),
            const SizedBox(height: 24),
            if (widget.isHost)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _players.isNotEmpty
                      ? _startGame
                      : null, // Host can start even alone for testing
                  icon: const Icon(Icons.play_arrow),
                  label:
                      const Text('بدء اللعبة', style: TextStyle(fontSize: 20)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              )
            else
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('في انتظار المضيف لبدء اللعبة...',
                    style:
                        TextStyle(fontSize: 16, fontStyle: FontStyle.italic)),
              ),
          ],
        ),
      ),
    );
  }
}
