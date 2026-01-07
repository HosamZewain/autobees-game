import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'join_room_screen.dart';
import 'create_room_screen.dart';
import 'online_users_screen.dart';
import 'lobby_screen.dart';
import '../../services/socket_service.dart';

class MultiplayerHomeScreen extends StatefulWidget {
  const MultiplayerHomeScreen({super.key});

  @override
  State<MultiplayerHomeScreen> createState() => _MultiplayerHomeScreenState();
}

class _MultiplayerHomeScreenState extends State<MultiplayerHomeScreen> {
  @override
  void initState() {
    super.initState();
    // Initialize socket connection when entering multiplayer section
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final socketService = context.read<SocketService>();
      socketService.initSocket();

      // Listen for incoming invites
      socketService.inviteReceivedStream.listen((data) {
        if (mounted) {
          _showInviteDialog(data['fromUsername'], data['fromSocketId']);
        }
      });

      // Listen for successful join via invite (for receiver)
      socketService.inviteAcceptedStream.listen((data) {
        if (mounted) {
          // If we are still on this screen (e.g. receiver), navigate to lobby
          // Note: The Inviter is on OnlineUsersScreen, Receiver is here or elsewhere.
          // This listener might trigger for both if the controller is broadcast and global?
          // Yes, broadcast. So both screens might try to push.
          // Check if we are already in lobby?
          // Simple check: `ModalRoute.of(context)?.isCurrent`
          if (ModalRoute.of(context)?.isCurrent == true) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => LobbyScreen(
                    roomId: data['roomId'],
                    isHost:
                        false, // We don't distinguish strictly here, assumed peer
                    playerName: "You" // Placeholder
                    ),
              ),
            );
          }
        }
      });
    });
  }

  void _showInviteDialog(String fromName, String fromSocketId) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('دعوة للعب'),
        content: Text('$fromName يدعوك للعب مباراة!'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context
                  .read<SocketService>()
                  .respondToInvite(fromSocketId, false);
            },
            child: const Text('رفض'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<SocketService>().respondToInvite(fromSocketId, true);
              // Show loading? The listener will handle navigation.
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('تم القبول! جاري إنشاء الغرفة...')),
              );
            },
            child: const Text('قبل'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('اللعب الجماعي'),
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.hub, size: 80, color: Colors.purple),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const CreateRoomScreen()),
                    );
                  },
                  icon: const Icon(Icons.add_circle_outline, size: 28),
                  label:
                      const Text('إنشاء غرفة', style: TextStyle(fontSize: 20)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const OnlineUsersScreen()),
                    );
                  },
                  icon: const Icon(Icons.people),
                  label: const Text('لاعبين متصلين',
                      style: TextStyle(fontSize: 20)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.blue,
                    side: const BorderSide(color: Colors.blue, width: 2),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const JoinRoomScreen()),
                    );
                  },
                  icon: const Icon(Icons.login, size: 28),
                  label: const Text('انضمام لغرفة',
                      style: TextStyle(fontSize: 20)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.purple,
                    side: const BorderSide(color: Colors.purple, width: 2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
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
