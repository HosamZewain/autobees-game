import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/socket_service.dart';
import 'profile_screen.dart';
import 'setup_screen.dart';
import 'multiplayer/multiplayer_home_screen.dart';
import 'leaderboard/leaderboard_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _beeController;
  late Animation<double> _beeAnimation;

  @override
  void initState() {
    super.initState();
    _beeController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
    _beeAnimation = Tween<double>(begin: -10, end: 10).animate(
      CurvedAnimation(parent: _beeController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _beeController.dispose();
    super.dispose();
  }

  String _getWelcomeMessage(String username) {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'صباح الخير، $username';
    if (hour < 17) return 'مرحباً، $username';
    return 'مساء الخير، $username';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final username = auth.user?['username'] ?? 'لاعب';

    return Scaffold(
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
              const SizedBox(height: 20),
              // Header with Settings
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const ProfileScreen()),
                      ),
                      // Changed to Person/Avatar icon as requested
                      icon: const Icon(Icons.person_rounded,
                          color: Color(0xFFA855F7), size: 30), // Purple Icon
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.all(12),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                        elevation: 2,
                        shadowColor: Colors.black.withOpacity(0.05),
                      ),
                    ),
                    const SizedBox(), // Spacer if needed
                  ],
                ),
              ),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 10),
                      // Floating Bee & Logo Area
                      AnimatedBuilder(
                        animation: _beeAnimation,
                        builder: (context, child) {
                          return Transform.translate(
                            offset: Offset(0, _beeAnimation.value),
                            child: child,
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(25),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color:
                                    const Color(0xFFA855F7).withOpacity(0.15),
                                blurRadius: 40,
                                offset: const Offset(0, 20),
                              )
                            ],
                          ),
                          child: Image.asset(
                            'assets/images/app_icon.png',
                            width: 100,
                            height: 100,
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Welcome Text
                      Text(
                        _getWelcomeMessage(username),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6B7280), // Muted Gray
                          fontFamily: 'Cairo',
                        ),
                      ),

                      const Text(
                        'Autobees Complete',
                        style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF4B0082), // Deep Purple
                            fontFamily: 'Cairo',
                            height: 1.2),
                      ),

                      const SizedBox(height: 10),

                      // Online Users Indicator
                      StreamBuilder<List<dynamic>>(
                        stream: context.read<SocketService>().onlineUsersStream,
                        initialData:
                            context.read<SocketService>().currentOnlineUsers,
                        builder: (context, snapshot) {
                          final count = snapshot.data?.length ?? 0;
                          return Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.green.withOpacity(0.2),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                )
                              ],
                              border: Border.all(
                                  color: Colors.green.withOpacity(0.1)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(
                                    color: Colors.green,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '$count لاعبين متصلين',
                                  style: const TextStyle(
                                    fontFamily: 'Cairo',
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green, // Vibrant Green
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 50),

                      // Main Action Buttons
                      _buildGradientButton(
                        context,
                        title: 'لعب فردي',
                        subtitle: 'تحدى نفسك',
                        icon: Icons.play_arrow_rounded,
                        gradientColors: [
                          const Color(0xFF4ADE80),
                          const Color(0xFF22C55E)
                        ], // Green
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const SetupScreen()),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildGradientButton(
                        context,
                        title: 'لعب جماعي',
                        subtitle: 'تحدى الأصدقاء',
                        icon: Icons.people_rounded,
                        gradientColors: [
                          const Color(0xFFA855F7),
                          const Color(0xFF7C3AED)
                        ], // Purple
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const MultiplayerHomeScreen()),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildGradientButton(
                        context,
                        title: 'سجل الألعاب',
                        subtitle: null,
                        icon: Icons.emoji_events_rounded,
                        gradientColors: [
                          const Color(0xFFFBBF24),
                          const Color(0xFFF59E0B)
                        ], // Amber/Orange
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const LeaderboardScreen()),
                        ),
                      ),

                      const SizedBox(height: 30),
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, '/login'),
                        // Note: Ideally navigate to login if not logged in, but just structure for now
                        child: Text(
                          auth.user != null ? '' : 'تسجيل الدخول',
                          style: const TextStyle(
                            fontFamily: 'Cairo',
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF7C3AED),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGradientButton(
    BuildContext context, {
    required String title,
    String? subtitle,
    required IconData icon,
    required List<Color> gradientColors,
    required VoidCallback onPressed,
  }) {
    return Container(
      width: double.infinity,
      height: 75,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: gradientColors.last.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(24),
          splashColor: Colors.white.withOpacity(0.2),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 20),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontFamily: 'Cairo',
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                        color: Colors.white,
                        height: 1.1,
                      ),
                    ),
                    if (subtitle != null)
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontFamily: 'Cairo',
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                  ],
                ),
                const Spacer(),
                Icon(Icons.arrow_forward_ios_rounded,
                    color: Colors.white.withOpacity(0.6), size: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
