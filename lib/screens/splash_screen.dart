import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import 'home_screen.dart';
import 'auth/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // Changed to TickerProviderStateMixin
  late AnimationController _fadeController; // Renamed
  late AnimationController _floatController; // Added
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _floatAnimation; // Added

  final List<String> _tips = [
    // Added
    'هل تعلم؟ أوتوبيس كومبليت تعتمد على السرعة والذكاء',
    'يمكنك تحدي أصدقائك في نمط اللعب الجماعي',
    'حاول ملء جميع الحقول للحصول على نقاط إضافية',
    'السرعة هي مفتاح الفوز في هذه اللعبة',
    'تأكد من صحة الكلمات للحصول على العلامة الكاملة',
  ];
  int _currentTipIndex = 0; // Added
  late Timer _tipTimer; // Added

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      // Renamed
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _fadeAnimation = CurvedAnimation(
        parent: _fadeController, curve: Curves.easeIn); // Used _fadeController

    _floatController = AnimationController(
      // Added
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _floatAnimation = Tween<Offset>(
      // Added
      begin: Offset.zero,
      end: const Offset(0, 0.05),
    ).animate(
        CurvedAnimation(parent: _floatController, curve: Curves.easeInOut));

    _fadeController.forward(); // Used _fadeController

    _tipTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      // Added
      if (mounted) {
        setState(() {
          _currentTipIndex = (DateTime.now().second ~/ 1.5) % _tips.length;
        });
      }
    });

    _checkAuth();
  }

  @override
  void dispose() {
    _fadeController.dispose(); // Renamed
    _floatController.dispose(); // Added
    _tipTimer.cancel(); // Added
    super.dispose();
  }

  Future<void> _checkAuth() async {
    // Wait for minimum display time
    await Future.delayed(const Duration(seconds: 4)); // Changed duration

    if (!mounted) return;

    final auth = context.read<AuthService>();

    if (auth.isAuthenticated) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
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
        child: Center(
          child: Consumer<AuthService>(
            builder: (context, auth, _) {
              return FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SlideTransition(
                      position: _floatAnimation,
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFA855F7)
                                  .withOpacity(0.2), // Purple shadow
                              blurRadius: 30,
                              spreadRadius: 10,
                            )
                          ],
                        ),
                        child: Hero(
                          tag: 'app_logo', // Added
                          child: Image.asset(
                            'assets/images/app_icon.png',
                            width: 160,
                            height: 160,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    const Text(
                      'أوتوبيس كومبليت',
                      style: TextStyle(
                        fontSize: 38, // Changed from 36
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF4B0082), // Deep Purple
                        fontFamily: 'Cairo',
                        // Removed letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 20), // Changed from 10
                    // Rotating Tips
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 500),
                      child: Text(
                        _tips[_currentTipIndex],
                        key: ValueKey<int>(_currentTipIndex),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFF6B7280), // Muted Gray
                          fontFamily: 'Cairo',
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 60),
                    if (!auth.isInitialized)
                      const CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                            Color(0xFFA855F7)), // Purple
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
