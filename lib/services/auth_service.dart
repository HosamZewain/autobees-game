import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

class AuthService extends ChangeNotifier {
  // For Android Emulator use 10.0.2.2, for iOS/macOS use localhost
  static const String baseUrl = 'http://localhost:3000/api/auth';

  final _storage = const FlutterSecureStorage();
  String? _token;
  Map<String, dynamic>? _user;

  bool _isInitialized = false;

  bool get isAuthenticated => _token != null;
  bool get isInitialized => _isInitialized;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;

  Future<void> loadUser() async {
    try {
      _token = await _storage.read(key: 'jwt_token');
      final userStr = await _storage.read(key: 'user_data');
      if (userStr != null) {
        _user = json.decode(userStr);
      }
    } catch (e) {
      print('Error loading user session: $e');
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> register(String username, String password,
      {String? email, String? gender, String? profilePic}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'username': username,
          'password': password,
          'email': email,
          'gender': gender,
          'profile_pic': profilePic
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 201) {
        await _saveSession(data['token'], data['user']);
        return {'success': true};
      } else {
        return {'success': false, 'error': data['error']};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        await _saveSession(data['token'], data['user']);
        return {'success': true};
      } else {
        return {'success': false, 'error': data['error']};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token'
        },
        body: json.encode(data),
      );

      final respData = json.decode(response.body);

      if (response.statusCode == 200) {
        await _saveSession(respData['token'], respData['user']);
        return {'success': true};
      } else {
        return {'success': false, 'error': respData['error']};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'user_data');
    _token = null;
    _user = null;
    notifyListeners();
  }

  Future<void> _saveSession(String token, Map<String, dynamic> user) async {
    _token = token;
    _user = user;
    await _storage.write(key: 'jwt_token', value: token);
    await _storage.write(key: 'user_data', value: json.encode(user));
    notifyListeners();
  }
}
