import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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
        fontFamily: 'Cairo',
        primarySwatch: Colors.amber,
        scaffoldBackgroundColor: const Color(0xFFFFF7E6),
        useMaterial3: true, // Keep useMaterial3 from original theme
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
