class MultiplayerPlayer {
  final String id;
  final String name;
  int score;

  MultiplayerPlayer({
    required this.id,
    required this.name,
    this.score = 0,
  });

  factory MultiplayerPlayer.fromJson(Map<String, dynamic> json) {
    return MultiplayerPlayer(
      id: json['id'] as String,
      name: json['name'] as String,
      score: json['score'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'score': score,
    };
  }
}

class RoomConfig {
  final int rounds;
  final int timeLimit;
  final List<String> categories;

  RoomConfig({
    required this.rounds,
    required this.timeLimit,
    required this.categories,
  });

  factory RoomConfig.fromJson(Map<String, dynamic> json) {
    return RoomConfig(
      rounds: json['rounds'] as int,
      timeLimit: json['timeLimit'] as int,
      categories: List<String>.from(json['categories'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rounds': rounds,
      'timeLimit': timeLimit,
      'categories': categories,
    };
  }
}

class MultiplayerRoom {
  final String roomId;
  final String ownerId;
  final List<MultiplayerPlayer> players;
  final RoomConfig config;
  String status;
  int currentRound;

  MultiplayerRoom({
    required this.roomId,
    required this.ownerId,
    required this.players,
    required this.config,
    this.status = 'lobby',
    this.currentRound = 0,
  });

  factory MultiplayerRoom.fromJson(Map<String, dynamic> json) {
    return MultiplayerRoom(
      roomId: json['roomId'] as String,
      ownerId: json['ownerId'] as String,
      players: (json['players'] as List<dynamic>?)
              ?.map((e) => MultiplayerPlayer.fromJson(e))
              .toList() ??
          [],
      config: RoomConfig.fromJson(json['config'] ?? {}),
      status: json['status'] as String? ?? 'lobby',
      currentRound: json['currentRound'] as int? ?? 0,
    );
  }
}
