import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:autobees_complete/services/auth_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../models/multiplayer_models.dart';

class SocketService extends ChangeNotifier {
  IO.Socket? _socket;
  AuthService? _authService;

  SocketService([this._authService]);

  void updateAuth(AuthService auth) {
    _authService = auth;
    // If we have a socket and it's connected/connecting, we might want to reconnect if token changed
    // But for simplicity, we'll let the user initiate connection or auto-connect logic handle it.
    // If not connected, initSocket will pick up the new token.
    if (_socket?.connected == false && _authService?.isAuthenticated == true) {
      initSocket();
    }
  }

  // ... Streams ...
  final _roomController = StreamController<MultiplayerRoom>.broadcast();
  final _gameStartedController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roundResultsController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _gameFinishedController =
      StreamController<Map<String, dynamic>>.broadcast();

  // Invite System Controllers
  final _onlineUsersController = StreamController<List<dynamic>>.broadcast();
  final _inviteReceivedController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _inviteAcceptedController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _inviteRejectedController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<MultiplayerRoom> get roomStream => _roomController.stream;
  Stream<Map<String, dynamic>> get gameStartedStream =>
      _gameStartedController.stream;
  Stream<Map<String, dynamic>> get roundResultsStream =>
      _roundResultsController.stream;
  Stream<Map<String, dynamic>> get gameFinishedStream =>
      _gameFinishedController.stream;

  Stream<List<dynamic>> get onlineUsersStream => _onlineUsersController.stream;
  Stream<Map<String, dynamic>> get inviteReceivedStream =>
      _inviteReceivedController.stream;
  Stream<Map<String, dynamic>> get inviteAcceptedStream =>
      _inviteAcceptedController.stream;
  Stream<Map<String, dynamic>> get inviteRejectedStream =>
      _inviteRejectedController.stream;

  String? get socketId => _socket?.id;
  bool get isConnected => _socket?.connected ?? false;

  void initSocket() {
    if (_authService?.isAuthenticated != true) {
      print('Socket Init Skipped: Not Authenticated');
      return;
    }

    // For Android Emulator use 10.0.2.2, for iOS Simulator/macOS use localhost
    const String serverUrl = 'http://localhost:3000';

    _socket = IO.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': _authService!.token}
    });

    _socket!.connect();

    _socket!.onConnect((_) {
      print('Connected to socket server');
      notifyListeners();
    });

    _socket!.onDisconnect((_) {
      print('Disconnected from socket server');
      notifyListeners();
    });

    _socket!.on('room_updated', (data) {
      if (data != null) {
        // We might need to reconstruct the full room object if the server sends partial updates
        // But our server sends { roomId, players, config } mostly.
        // Let's assume for now we construct a partial room or receive full room object.
        // Actually, for simplicity, let's just expose the raw data or updated fields.
        // The server sends: { roomId, players: [...], config: {...} }
        // We can reconstruct enough for the UI.

        // This is a bit hacky as we don't have the full state on client always,
        // but for the Lobby, we just need players.
        // Let's rely on callback for initial state and this for updates.

        print('Room Updated: $data');
        // We can emit a simplified object or map
        // _roomController.add(MultiplayerRoom.fromJson(data));
      }
    });

    // Better approach: Listen to specific events and update local state
    _socket!.on('room_updated', (data) {
      // Expecting same structure as MultiplayerRoom (mostly)
      // Server sends: { roomId, players, config }
      try {
        // Create a temporary object to hold the data
        final room = MultiplayerRoom(
          roomId: data['roomId'],
          ownerId: "", // Not always sent in update, might need tracking
          players: (data['players'] as List)
              .map((e) => MultiplayerPlayer.fromJson(e))
              .toList(),
          config: RoomConfig.fromJson(data['config']),
          status: 'lobby', // or tracking
        );
        _roomController.add(room);
      } catch (e) {
        print("Error parsing room_updated: $e");
      }
    });

    _socket!.on('game_started', (data) {
      print('Game Started: $data');
      _gameStartedController.add(data);
    });

    _socket!.on('round_results', (data) {
      print('Round Results: $data');
      _roundResultsController.add(data);
    });

    _socket!.on('game_finished', (data) {
      print('Game Finished: $data');
      _gameFinishedController.add(data);
    });

    // Invite System Listeners
    _socket!.on('online_users', (data) {
      // data should be List<dynamic>
      _onlineUsersController.add(data as List<dynamic>);
    });

    _socket!.on('invite_received', (data) {
      print('Invite Received: $data');
      _inviteReceivedController.add(data);
    });

    _socket!.on('invite_accepted', (data) {
      print('Invite Accepted: $data');
      _inviteAcceptedController.add(data);
    });

    _socket!.on('invite_rejected', (data) {
      print('Invite Rejected: $data');
      _inviteRejectedController.add(data);
    });
  }

  void createRoom(
      RoomConfig config, String playerName, Function(dynamic) callback) {
    if (_socket == null) return;
    _socket!.emitWithAck('create_room', config.toJson(), ack: (data) {
      callback(data);
    });
  }

  void joinRoom(String roomId, String playerName, Function(dynamic) callback) {
    if (_socket == null) return;
    _socket!.emitWithAck(
        'join_room', {'roomId': roomId, 'playerName': playerName}, ack: (data) {
      callback(data);
    });
  }

  void startGame(String roomId) {
    _socket?.emit('start_game', {'roomId': roomId});
  }

  void submitAnswers(String roomId, Map<String, String> answers) {
    _socket?.emit('submit_answers', {'roomId': roomId, 'answers': answers});
  }

  void nextRound(String roomId) {
    _socket?.emit('next_round', {'roomId': roomId});
  }

  // Invite System Methods
  void sendInvite(String toSocketId) {
    _socket?.emit('send_invite', {'toSocketId': toSocketId});
  }

  void respondToInvite(String toSocketId, bool accepted) {
    _socket?.emit(
        'respond_invite', {'toSocketId': toSocketId, 'accepted': accepted});
  }

  @override
  void dispose() {
    _socket?.dispose();
    _roomController.close();
    _gameStartedController.close();
    _roundResultsController.close();
    _gameFinishedController.close();
    _onlineUsersController.close();
    _inviteReceivedController.close();
    _inviteAcceptedController.close();
    _inviteRejectedController.close();
    super.dispose();
  }
}
