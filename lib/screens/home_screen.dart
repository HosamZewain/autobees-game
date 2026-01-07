import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'profile_screen.dart';
import 'setup_screen.dart';
import 'multiplayer/multiplayer_home_screen.dart';

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
      duration: const Duration(seconds: 10),
    )..repeat();
    _beeAnimation =
        Tween<double>(begin: 0, end: 2 * math.pi).animate(_beeController);
  }

  @override
  void dispose() {
    _beeController.dispose();
    super.dispose();
  }

  String _getWelcomeMessage(String username) {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'صباح الخير، $username';
    if (hour < 17) return 'مرحباً بك، $username';
    return 'مساء الخير، $username';
  }

  void _showHowToPlay() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(25.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('كيفية اللعب 🎮',
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cairo')),
            const SizedBox(height: 20),
            _buildHowToItem(Icons.spellcheck,
                'اختر حرفاً وابدأ بإدخال الكلمات التي تبدأ به في كل فئة.'),
            _buildHowToItem(Icons.timer_outlined,
                'أنهِ جميع الفئات في أسرع وقت ممكن لتسبق الوقت.'),
            _buildHowToItem(Icons.stars_rounded,
                'ستحصل على 10 نقاط لكل كلمة صحيحة، و5 نقاط إذا تشابهت مع المنافس.'),
            _buildHowToItem(Icons.emoji_events_outlined,
                'اللاعب الذي يجمع أكبر عدد من النقاط هو الفائز بالدورة!'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF66BB6A),
                  foregroundColor: Colors.white),
              child: const Text('فهمت، لنبدأ!',
                  style: TextStyle(fontFamily: 'Cairo')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHowToItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF5D4037)),
          const SizedBox(width: 15),
          Expanded(
              child: Text(text,
                  style: const TextStyle(fontFamily: 'Cairo', fontSize: 14),
                  textAlign: TextAlign.right)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final username = auth.user?['username'] ?? 'لاعب';

    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient & Image
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/game_bg.png'),
                fit: BoxFit.cover,
                opacity: 0.8,
              ),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Color(0x995D4037)],
              ),
            ),
          ),

          // Animated Bee Character
          AnimatedBuilder(
            animation: _beeAnimation,
            builder: (context, child) {
              return Positioned(
                left: 50 + 30 * math.cos(_beeAnimation.value),
                top: 150 + 20 * math.sin(_beeAnimation.value * 2),
                child: Image.asset('assets/images/app_icon.png',
                    width: 60, height: 60),
              );
            },
          ),

          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Hero(
                  tag: 'app_logo',
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          blurRadius: 25,
                          color: Colors.black.withOpacity(0.2),
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Image.asset(
                        'assets/images/app_icon.png',
                        width: 140,
                        height: 140,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  _getWelcomeMessage(username),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF5D4037),
                    fontFamily: 'Cairo',
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'أوتوبيس كومبليت',
                  style: TextStyle(
                    fontSize: 42,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF5D4037),
                    shadows: [
                      Shadow(
                          color: Colors.white,
                          blurRadius: 4,
                          offset: Offset(2, 2))
                    ],
                  ),
                ),
                const SizedBox(height: 40),
                _buildHomeButton(
                  context,
                  title: 'بدء اللعبة',
                  color: const Color(0xFF66BB6A),
                  icon: Icons.play_arrow_rounded,
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SetupScreen()),
                  ),
                ),
                const SizedBox(height: 20),
                _buildHomeButton(
                  context,
                  title: 'لعب جماعي',
                  color: Colors.purple.shade400,
                  icon: Icons.people_rounded,
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const MultiplayerHomeScreen()),
                  ),
                ),
                const SizedBox(height: 20),
                _buildHomeButton(
                  context,
                  title: 'الإعدادات',
                  color: const Color(0xFF5D4037),
                  icon: Icons.settings_rounded,
                  isOutlined: true,
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProfileScreen()),
                  ),
                ),
                const SizedBox(height: 30),
                TextButton.icon(
                  onPressed: _showHowToPlay,
                  icon:
                      const Icon(Icons.help_outline, color: Color(0xFF5D4037)),
                  label: const Text('شرح طريقة اللعب',
                      style: TextStyle(
                          color: Color(0xFF5D4037),
                          fontSize: 16,
                          fontFamily: 'Cairo',
                          decoration: TextDecoration.underline)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHomeButton(
    BuildContext context, {
    required String title,
    required Color color,
    required IconData icon,
    required VoidCallback onPressed,
    bool isOutlined = false,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 40),
      height: 60,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: (isOutlined ? Colors.black : color).withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          )
        ],
      ),
      child: isOutlined
          ? OutlinedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 28),
              label: Text(title),
              style: OutlinedButton.styleFrom(
                foregroundColor: color,
                backgroundColor: Colors.white.withOpacity(0.9),
                side: BorderSide(color: color, width: 2.5),
                textStyle: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cairo'),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30)),
              ),
            )
          : ElevatedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 28),
              label: Text(title),
              style: ElevatedButton.styleFrom(
                backgroundColor: color,
                foregroundColor: Colors.white,
                textStyle: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cairo'),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30)),
                elevation: 0,
              ),
            ),
    );
  }
}
