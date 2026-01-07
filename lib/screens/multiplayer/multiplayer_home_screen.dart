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
        title: const Text('اللعب الجماعي',
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
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFA855F7).withOpacity(0.2),
                        blurRadius: 30,
                        offset: const Offset(0, 15),
                      )
                    ],
                  ),
                  child: const Icon(Icons.hub_rounded,
                      size: 80, color: Color(0xFFA855F7)),
                ),
                const SizedBox(height: 48),
                _buildMultiplayerButton(
                  context,
                  title: 'إنشاء غرفة',
                  icon: Icons.add_circle_rounded,
                  color: const Color(0xFFA855F7), // Purple
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const CreateRoomScreen()),
                    );
                  },
                ),
                const SizedBox(height: 20),
                _buildMultiplayerButton(
                  context,
                  title: 'انضمام لغرفة',
                  icon: Icons.login_rounded,
                  color: const Color(0xFF22C55E), // Green
                  isOutlined: false,
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const JoinRoomScreen()),
                    );
                  },
                ),
                const SizedBox(height: 20),
                _buildMultiplayerButton(
                  context,
                  title: 'لاعبين متصلين',
                  icon: Icons.people_alt_rounded,
                  color: const Color(0xFF3B82F6), // Blue
                  isOutlined: true,
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const OnlineUsersScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMultiplayerButton(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
    bool isOutlined = false,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 70,
      child: isOutlined
          ? OutlinedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 28),
              label: Text(title,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo')),
              style: OutlinedButton.styleFrom(
                foregroundColor: color,
                side: BorderSide(color: color, width: 2),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20)),
                backgroundColor: Colors.white.withOpacity(0.8),
              ),
            )
          : ElevatedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 28, color: Colors.white),
              label: Text(title,
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                      color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: color,
                elevation: 5,
                shadowColor: color.withOpacity(0.4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
    );
  }
}
