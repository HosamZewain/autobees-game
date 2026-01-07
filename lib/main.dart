import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:autobees_complete/controllers/game_controller.dart';
import 'package:autobees_complete/services/socket_service.dart';
import 'package:autobees_complete/services/auth_service.dart';
import 'package:autobees_complete/screens/splash_screen.dart';

void main() {
  runApp(const AutobeesApp());
}

class AutobeesApp extends StatelessWidget {
  const AutobeesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()..loadUser()),
        ChangeNotifierProxyProvider<AuthService, SocketService>(
          create: (context) => SocketService(context.read<AuthService>()),
          update: (context, auth, previousSocket) =>
              previousSocket!..updateAuth(auth),
        ),
        ChangeNotifierProvider(
            create: (context) => GameController(context.read<AuthService>())),
      ],
      child: const MyApp(),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Autobees Complete',
      theme: ThemeData(
        textTheme: GoogleFonts.cairoTextTheme(Theme.of(context).textTheme),
        colorScheme: ColorScheme.fromSwatch().copyWith(
          primary: const Color(0xFFA855F7), // Purple 500
          secondary: const Color(0xFF22C55E), // Green 500
        ),
        scaffoldBackgroundColor: const Color(0xFFFDF4FF), // Very Light Purple
        useMaterial3: true,
      ),
      home: const SplashScreen(),
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        );
      },
    );
  }
}
