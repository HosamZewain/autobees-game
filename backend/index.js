const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
const { register, login } = require('./src/controllers/authController');
const { updateUserStats, db, logMatch, checkWord, suggestWord, getTopPlayers } = require('./src/data/database');
const { socketAuthMiddleware, expressAuthMiddleware } = require('./src/middleware/authMiddleware');
const adminMiddleware = require('./src/middleware/adminMiddleware');
const adminController = require('./src/controllers/adminController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Admin Dashboard
app.use('/admin', express.static(path.join(__dirname, 'admin-dashboard/dist')));

// Serve Static Game Client (Web App)
app.use(express.static(path.join(__dirname, '../web-app/dist')));

// Public Auth Routes

app.post('/api/auth/register', register);
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Protected Auth Routes
const authRouter = express.Router();
authRouter.use(expressAuthMiddleware);
authRouter.put('/profile', require('./src/controllers/authController').updateProfile);
app.use('/api/auth', authRouter);

// Admin Routes (Protected)
const adminRouter = express.Router();
adminRouter.use(expressAuthMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.get('/users', adminController.getUsers);
adminRouter.post('/users', adminController.createUser);
adminRouter.put('/users/:id', adminController.editUser);
adminRouter.post('/users/:id/status', adminController.toggleUserStatus);
adminRouter.get('/settings', adminController.getSettings);
adminRouter.post('/settings', adminController.updateSettings);
adminRouter.get('/dictionary', adminController.getDictionary);
adminRouter.post('/dictionary', adminController.addWord);
adminRouter.post('/dictionary', adminController.addWord);
adminRouter.delete('/dictionary/:id', adminController.deleteWord);
adminRouter.get('/history', adminController.getMatchHistory);

// Suggestions
adminRouter.get('/suggestions', adminController.getSuggestions);
adminRouter.post('/suggestions/:id/approve', adminController.approveSuggestion);
adminRouter.delete('/suggestions/:id', adminController.deleteSuggestion);

// Admin Stats (Logic lives here to access 'rooms')
// Admin Stats (Logic lives here to access 'rooms')
adminRouter.get('/stats', async (req, res) => {
    try {
        // Use db.query which wraps pool.execute and returns [rows]
        const topUsers = await db.query("SELECT username, wins, total_score FROM users ORDER BY wins DESC, total_score DESC LIMIT 10");
        const userCount = await db.query("SELECT COUNT(*) as count FROM users");
        const matchCount = await db.query("SELECT COUNT(*) as count FROM matches");
        const wordCount = await db.query("SELECT COUNT(*) as count FROM dictionary");

        const totalUsers = userCount[0]?.count || 0;
        const totalGames = matchCount[0]?.count || 0;
        const totalWords = wordCount[0]?.count || 0;

        const roomsDetails = [];
        let connectedPlayers = 0;

        for (const [roomId, room] of rooms.entries()) {
            connectedPlayers += room.players.length;
            roomsDetails.push({
                roomId: roomId,
                players: room.players.length,
                status: room.status
            });
        }

        res.json({
            activeRooms: rooms.size,
            connectedPlayers: connectedPlayers,
            totalUsers: totalUsers,
            totalGames: totalGames,
            totalWords: totalWords,
            topUsers: topUsers,
            roomsDetails: roomsDetails
        });
    } catch (err) {
        console.error("Stats API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.use('/api/admin', adminRouter);

// Public Match Routes
app.post('/api/matches/log', expressAuthMiddleware, async (req, res) => {
    try {
        const { details } = req.body;
        console.log(`[Match History] Logging solo game for user ${req.user.id}`);
        // roomId for single player can be 'solo'
        await logMatch('solo', details);

        // Update User Stats for Solo Game
        if (details && details.players && details.players.length > 0) {
            const score = details.players[0].score || 0;
            const isWin = score > 0; // Consider it a win if they got points
            await updateUserStats(req.user.id, isWin, score);
            console.log(`[Match History] Stats updated for user ${req.user.id}: Score=${score}, Win=${isWin}`);
        }

        console.log(`[Match History] Game logged successfully.`);
        res.json({ success: true });
    } catch (err) {
        console.error('[Match History] Error logging game:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Helper route to get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const topPlayers = await getTopPlayers(10);
        res.json(topPlayers);
    } catch (err) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// User Match History
app.get('/api/history', expressAuthMiddleware, async (req, res) => {
    try {
        const { getUserMatches } = require('./src/data/database');
        const history = await getUserMatches(req.user.id);
        res.json(history);
    } catch (err) {
        console.error('History API Error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Public Word Validation
app.post('/api/dictionary/validate', expressAuthMiddleware, async (req, res) => {
    try {
        const { word, category, letter } = req.body;
        if (!word || !category || !letter) return res.status(400).json({ error: 'Missing fields' });

        const isValid = await checkWord(word, category, letter);

        // If INVALID, save as a suggestion for admin review
        if (!isValid) {
            await suggestWord(word, category, letter, req.user.id);
        }

        res.json({ isValid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dev/Seed Routes
app.post('/api/seed/admin', adminController.createFirstAdmin);

// SPA Fallback for Admin Dashboard
app.get(/^\/admin.*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard/dist/index.html'));
});

// SPA Fallback for Game Client (Must be last)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(__dirname, '../web-app/dist/index.html'));
});

// Socket.IO Middleware
io.use(socketAuthMiddleware);

console.log("Autobees Backend starting...");

// Data Stores
const rooms = new Map();
const onlineUsers = new Map(); // socket.id -> { id, username }

// CONSTANTS
const ARABIC_LETTERS = [
    "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"
];

io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`User connected: ${socket.id} (Ref: ${user.username})`);

    // Track Online User
    onlineUsers.set(socket.id, {
        socketId: socket.id,
        userId: user.id,
        username: user.username
    });

    // Broadcast updated list to all clients
    io.emit("online_users", Array.from(onlineUsers.values()));
    broadcastRoomsList();

    // Create Room
    socket.on("create_room", (config, callback) => {
        const roomId = generateRoomId();
        // Ensure config is an object if a string was passed (backward compatibility/web fix)
        let roomConfig = typeof config === 'string' ? { name: config } : config;

        // Add defaults
        roomConfig = {
            rounds: 3,
            timeLimit: 60,
            categories: ["ولد", "بنت", "حيوان", "جماد", "نبات", "بلد", "شخصية مشهورة"],
            ...roomConfig
        };

        const room = {
            roomId,
            ownerId: socket.id,
            ownerUserId: socket.user.id, // Persist owner by User ID
            players: [],
            config: roomConfig,
            status: "lobby", // lobby, playing, results, finished
            currentRound: 0,
            currentLetter: "",
            answers: {},
            scores: {},
            roundScores: {},
        };

        rooms.set(roomId, room);
        joinRoomLogic(socket, roomId, callback);
        broadcastRoomsList();
    });

    // Join Room
    socket.on("join_room", (data, callback) => {
        // Handle both string and object input
        const roomId = (typeof data === 'object' && data.roomId) ? data.roomId : data;
        joinRoomLogic(socket, roomId, callback);
        broadcastRoomsList();
    });

    // Start Game
    socket.on("start_game", (data) => {
        const roomId = (typeof data === 'object' && data.roomId) ? data.roomId : data;
        const room = rooms.get(roomId);
        console.log(`[Start Game] Request for ${roomId} from ${socket.id} (Owner: ${room?.ownerId}, OwnerUser: ${room?.ownerUserId})`);

        if (!room) return;

        // Allow start if socket.id matches OR persistent ownerUserId matches
        const isOwner = room.ownerId === socket.id || (room.ownerUserId && room.ownerUserId === socket.user.id);

        if (!isOwner) {
            console.log(`[Start Game] Denied: Not owner.`);
            return;
        }

        room.status = "playing";
        room.currentRound = 1;
        startRound(roomId);
    });

    // Submit Answers
    socket.on("submit_answers", ({ roomId, answers }) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== "playing") return;

        if (!room.answers[room.currentRound]) {
            room.answers[room.currentRound] = {};
        }

        room.answers[room.currentRound][socket.id] = answers;

        const submittedCount = Object.keys(room.answers[room.currentRound]).length;
        if (submittedCount === room.players.length) {
            finishRound(roomId);
        }
    });

    // Next Round
    socket.on("next_round", ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room || room.ownerId !== socket.id) return;

        if (room.currentRound < room.config.rounds) {
            room.currentRound++;
            startRound(roomId);
        } else {
            finishGame(roomId);
        }
    });

    // --- Invite System ---

    socket.on("send_invite", ({ toSocketId }) => {
        const targetSocket = io.sockets.sockets.get(toSocketId);
        if (targetSocket) {
            targetSocket.emit("invite_received", {
                fromSocketId: socket.id,
                fromUsername: user.username
            });
        }
    });

    socket.on("respond_invite", ({ toSocketId, accepted }) => {
        const targetSocket = io.sockets.sockets.get(toSocketId);
        if (!targetSocket) return;

        if (accepted) {
            // Create a new room for them automatically
            const roomId = generateRoomId();
            const config = {
                rounds: 3,
                timeLimit: 60,
                categories: ["ولد", "بنت", "حيوان", "جماد", "نبات", "بلد", "شخصية مشهورة"] // Default defaults
            };

            const room = {
                roomId,
                ownerId: socket.id, // The responder becomes owner? Or inviter? Let's say responder for simplicity of flow here, or inviter. 
                // Let's make the INVITER (targetSocket) the owner logically, or just the one who responded. 
                // Let's stick to standard flow: Create room, force join both.
                players: [],
                config,
                status: "lobby",
                currentRound: 0,
                currentLetter: "",
                answers: {},
                scores: {},
                roundScores: {},
            };
            rooms.set(roomId, room);

            // Force join both
            joinRoomLogic(socket, roomId);
            joinRoomLogic(targetSocket, roomId);

            // Notify both to navigate to lobby
            // They receive 'room_updated' from joinRoomLogic, but we might want an explicit 'invite_accepted' ack
            // Ideally 'room_updated' causes navigation in frontend if they are in 'idle' state. 
            // We can emit a specific 'game_found' or just let room_updated do the work if they listen globally.

            // Let's emit 'invite_accepted' to the sender so they know to stop waiting/showing spinner
            targetSocket.emit("invite_accepted", { roomId });
            socket.emit("invite_accepted", { roomId });

        } else {
            targetSocket.emit("invite_rejected", { fromUsername: user.username });
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        handleDisconnect(socket);

        // Remove from online users
        onlineUsers.delete(socket.id);
        io.emit("online_users", Array.from(onlineUsers.values()));
        broadcastRoomsList();
    });
});

function broadcastRoomsList() {
    const roomsList = Array.from(rooms.values()).map(r => ({
        id: r.roomId,
        name: r.config.name || `Room ${r.roomId}`,
        players: r.players.length,
        maxPlayers: 10,
        status: r.status
    }));
    io.emit('rooms_list', roomsList);
}

// --- Helper Functions ---

function generateRoomId() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (rooms.has(result)) return generateRoomId();
    return result;
}

function emitRoomUpdate(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    io.to(roomId).emit("room_updated", {
        id: room.roomId, // Frontend expects .id
        roomId: room.roomId,
        players: room.players, // Array of player objects
        config: room.config,
        status: room.status,
        ownerUserId: room.ownerUserId,
        letter: room.currentLetter,
        round: room.currentRound,
        timeLeft: room.config.timeLimit // For reference
    });
}

function joinRoomLogic(socket, roomId, callback) {
    const room = rooms.get(roomId);
    if (!room) {
        if (callback) callback({ error: "Room not found" });
        return;
    }

    if (room.status !== "lobby") {
        if (callback) callback({ error: "Game already started" });
        return;
    }

    const existingIndex = room.players.findIndex(p => p.userId === socket.user.id);
    if (existingIndex !== -1) {
        // Update socket ID for existing user (re-connection)
        room.players[existingIndex].id = socket.id;

        // If this user was the owner, update the ownerId to the new socket ID
        if (room.ownerUserId === socket.user.id) {
            room.ownerId = socket.id;
            console.log(`[Join Room] Owner ${socket.user.username} reconnected. Updated ownerId to ${socket.id}`);
        }

        socket.join(roomId);
    } else {
        const player = {
            id: socket.id,
            userId: socket.user.id,
            name: socket.user.username,
            profile_pic: socket.user.profile_pic,
            score: 0
        };
        room.players.push(player);
        room.scores[socket.id] = 0;
        socket.join(roomId);
    }

    emitRoomUpdate(roomId);

    if (callback) callback({ roomId, config: room.config, players: room.players, ownerId: room.ownerId, ownerUserId: room.ownerUserId });
}

function startRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const letter = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    room.currentLetter = letter;
    room.status = "playing";

    emitRoomUpdate(roomId); // Notify status change

    io.to(roomId).emit("game_started", {
        currentRound: room.currentRound,
        letter,
        categories: room.config.categories,
        timeLimit: room.config.timeLimit
    });

    if (room.roundTimer) clearTimeout(room.roundTimer);

    room.roundTimer = setTimeout(() => {
        finishRound(roomId);
    }, (room.config.timeLimit + 2) * 1000);
}

async function finishRound(roomId) {
    const room = rooms.get(roomId);
    if (!room || room.status !== "playing") return;

    if (room.roundTimer) clearTimeout(room.roundTimer);
    room.status = "results";

    const currentRoundAnswers = room.answers[room.currentRound] || {};
    const roundScoresv = await calculateScores(room, currentRoundAnswers);

    room.players.forEach(p => {
        p.score = room.scores[p.id];
    });

    const isFinalRound = room.currentRound >= room.config.rounds;

    io.to(roomId).emit("round_results", {
        round: room.currentRound,
        results: roundScoresv,
        players: room.players,
        isFinal: isFinalRound
    });

    if (isFinalRound) {
        finishGame(roomId);
    }
}

async function finishGame(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.status = "finished";
    const rankedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const highestScore = rankedPlayers[0]?.score || 0;

    // Log match to DB
    const matchDetails = {
        players: rankedPlayers.map(p => ({ name: p.name, score: p.score })),
        config: room.config,
        scores: room.scores
    };
    try {
        await logMatch(roomId, matchDetails);
    } catch (e) {
        console.error("Failed to log match:", e.message);
    }

    for (const p of rankedPlayers) {
        try {
            const isWinner = p.score === highestScore && p.score > 0;
            await updateUserStats(p.userId, isWinner, p.score);
        } catch (e) {
            console.error(`Failed to update stats for user ${p.name}:`, e.message);
        }
    }

    io.to(roomId).emit("game_finished", {
        ranking: rankedPlayers
    });
    emitRoomUpdate(roomId);
}

async function calculateScores(room, allAnswers) {
    const results = {};
    room.players.forEach(p => {
        results[p.id] = { total: 0, categories: {} };
    });

    const categories = room.config.categories;
    const normalizedTargetLetter = normalizeArabic(room.currentLetter);

    for (const cat of categories) {
        const valuesMap = {}; // Maps normalizedVal -> [originalVal, [playerIds]]

        // First pass: Group by normalized value
        const playerAnswers = {};

        for (const p of room.players) {
            const pAnswers = allAnswers[p.id] || {};
            const rawVal = (pAnswers[cat] || "").trim();
            const normalizedVal = normalizeArabic(rawVal);

            playerAnswers[p.id] = { raw: rawVal, normalized: normalizedVal };

            // 1. Basic Validation: Empty or Wrong Letter
            if (!rawVal || rawVal.length === 0 || !normalizedVal.startsWith(normalizedTargetLetter)) {
                results[p.id].categories[cat] = { value: rawVal, score: 0, type: "red" };
            } else {
                // 2. Dictionary Validation
                const exists = await db.checkWord(rawVal, cat, room.currentLetter);
                if (!exists) {
                    results[p.id].categories[cat] = { value: rawVal, score: 0, type: "red" };
                } else {
                    if (!valuesMap[normalizedVal]) valuesMap[normalizedVal] = [];
                    valuesMap[normalizedVal].push(p.id);
                }
            }
        }

        // Second pass: Scoring based on uniqueness of NORMALIZED value
        Object.keys(valuesMap).forEach(normKey => {
            const playerIds = valuesMap[normKey];
            const isUnique = playerIds.length === 1;
            const points = isUnique ? 10 : 5;
            const type = isUnique ? "green" : "yellow";

            playerIds.forEach(pid => {
                results[pid].categories[cat] = { value: playerAnswers[pid].raw, score: points, type: type };
                results[pid].total += points;

                if (!room.scores[pid]) room.scores[pid] = 0;
                room.scores[pid] += points;
            });
        });
    }
    return results;
}

function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[أإآ]/g, 'ا') // Normalize Alifs
        .replace(/ة/g, 'ه')     // Normalize Ta Marbuta
        .replace(/ى/g, 'ي');    // Normalize Alef Maqsura (Optional but good)
}

function handleDisconnect(socket) {
    for (const [roomId, room] of rooms.entries()) {
        const index = room.players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            room.players.splice(index, 1);
            emitRoomUpdate(roomId);

            if (room.players.length === 0) {
                rooms.delete(roomId);
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Autobees Backend running on port ${PORT}`);
});
