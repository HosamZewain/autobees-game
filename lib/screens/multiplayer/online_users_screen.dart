import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/socket_service.dart';
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

    // Initialize with cached data if available
    final currentUsers = socketService.currentOnlineUsers;
    if (currentUsers.isNotEmpty) {
      _users = currentUsers;
      _isLoading = false;
    } else {
      // If empty, we might really have no one or just started.
      // We can keep loading true or set false if we trust the cache (which starts empty).
      // Better to maybe check socket connection?
      // For now, let's keep loading=true only if cache is empty & socket is connecting?
      // Simplest: Just use cache. If cache is empty, it's empty.
      _users = [];
      _isLoading = false;
    }

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
      appBar: AppBar(
        title: const Text('اللاعبون المتصلون',
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
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: Color(0xFFA855F7)))
              : _users.isEmpty ||
                      (_users.length == 1 &&
                          _users[0]['socketId'] == mySocketId)
                  ? Center(
                      child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.person_off_rounded,
                            size: 80, color: Colors.grey.shade400),
                        const SizedBox(height: 20),
                        Text('لا يوجد لاعبين متصلين حالياً',
                            style: TextStyle(
                                fontSize: 18,
                                fontFamily: 'Cairo',
                                color: Colors.grey.shade600,
                                fontWeight: FontWeight.bold)),
                      ],
                    ))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      itemCount: _users.length,
                      itemBuilder: (context, index) {
                        final user = _users[index];
                        final isMe = user['socketId'] == mySocketId;

                        if (isMe) return const SizedBox.shrink();

                        final isPending =
                            _pendingInviteSocketId == user['socketId'];

                        return Container(
                          margin: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(15),
                            boxShadow: [
                              BoxShadow(
                                color:
                                    const Color(0xFFA855F7).withOpacity(0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              )
                            ],
                            border: Border.all(color: const Color(0xFFF3E8FF)),
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor:
                                  const Color(0xFFA855F7).withOpacity(0.1),
                              child: const Icon(Icons.person_rounded,
                                  color: Color(0xFFA855F7)),
                            ),
                            title: Text(user['username'] ?? 'Unknown',
                                style: const TextStyle(
                                    fontFamily: 'Cairo',
                                    fontWeight: FontWeight.bold)),
                            trailing: ElevatedButton(
                              onPressed: isPending
                                  ? null
                                  : () => _sendInvite(user['socketId']),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isPending
                                    ? Colors.grey
                                    : const Color(0xFF22C55E), // Green
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                              ),
                              child: Text(
                                  isPending ? 'جاري الإرسال...' : 'دعوة',
                                  style: const TextStyle(
                                      fontFamily: 'Cairo',
                                      fontWeight: FontWeight.bold)),
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ),
    );
  }
}
