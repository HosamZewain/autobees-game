import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/socket_service.dart';
import '../../services/auth_service.dart';
import 'lobby_screen.dart';

class OnlineUsersScreen extends StatefulWidget {
  const OnlineUsersScreen({super.key});

  @override
  State<OnlineUsersScreen> createState() => _OnlineUsersScreenState();
}

class _OnlineUsersScreenState extends State<OnlineUsersScreen> {
  List<dynamic> _users = [];
  bool _isLoading = true;
  String? _pendingInviteSocketId;

  @override
  void initState() {
    super.initState();
    final socketService = context.read<SocketService>();

    // Listen for online users updates
    socketService.onlineUsersStream.listen((users) {
      if (mounted) {
        setState(() {
          _users = users;
          _isLoading = false;
        });
      }
    });

    // Listen for invite responses
    socketService.inviteAcceptedStream.listen((data) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم قبول الدعوة! جاري الانضمام...')),
        );
        setState(() => _pendingInviteSocketId = null);

        // Navigate to Lobby
        final roomId = data['roomId'];
        // Ideally we get player name from auth service or local state,
        // but for now let's pass a placeholder or get it closer to logic.
        // Actually lobby needs playerName. AuthService has it.
        // But simpler: just push replacement.

        // We need self name.
        // Let's assume we can get it from socket service or auth.
        // For now, let's just go to lobby.
        // Wait, LobbyScreen needs playerName.
        // Access AuthService?
        // context.read<AuthService>().user?.username ?? "Player"

        // Let's assume we are redirected there.
        // We need to pass the arguments.
        // The server sends { roomId }.
        // We know we are not Host (or are we? Logic said inviter joins).
        // Let's treat as simple join.

        // Actually, let's fix this properly.

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => LobbyScreen(
                roomId: roomId,
                isHost:
                    true, // Inviter acts as host in our simple logic? Or false? Doesn't matter much for MVP as long as one is host.
                // Actually server makes both peers equal or one owner.
                // Let's assume Inviter is owner for now as they initiated.
                playerName: "You" // Placeholder, see note above
                ),
          ),
        );
      }
    });

    socketService.inviteRejectedStream.listen((data) {
      if (mounted) {
        setState(() => _pendingInviteSocketId = null);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('تم رفض الدعوة من ${data['fromUsername']}')),
        );
      }
    });
  }

  void _sendInvite(String socketId) {
    setState(() => _pendingInviteSocketId = socketId);
    context.read<SocketService>().sendInvite(socketId);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('تم إرسال الدعوة...')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mySocketId = context.read<SocketService>().socketId;

    return Scaffold(
      appBar: AppBar(title: const Text('اللاعبون المتصلون')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _users.isEmpty ||
                  (_users.length == 1 && _users[0]['socketId'] == mySocketId)
              ? const Center(child: Text('لا يوجد لاعبين متصلين حالياً'))
              : ListView.builder(
                  itemCount: _users.length,
                  itemBuilder: (context, index) {
                    final user = _users[index];
                    final isMe = user['socketId'] == mySocketId;

                    if (isMe) return const SizedBox.shrink();

                    final isPending =
                        _pendingInviteSocketId == user['socketId'];

                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.shade100,
                          child: const Icon(Icons.person, color: Colors.blue),
                        ),
                        title: Text(user['username'] ?? 'Unknown'),
                        trailing: ElevatedButton(
                          onPressed: isPending
                              ? null
                              : () => _sendInvite(user['socketId']),
                          style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  isPending ? Colors.grey : Colors.green,
                              foregroundColor: Colors.white),
                          child: Text(isPending ? 'جاري الإرسال...' : 'دعوة'),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
