const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
const { register, login } = require('./src/controllers/authController');
const { updateUserStats, db, logMatch, checkWord, suggestWord, getTopPlayers, getAdminStats } = require('./src/data/database_mysql');
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Static Admin Dashboard
app.use('/admin', express.static(path.join(__dirname, 'admin-dashboard/dist')));

// Serve Static Game Client (Web App)
app.use(express.static(path.join(__dirname, '../web-app/dist')));

// Public Auth Routes

app.post('/api/auth/register', register);
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

app.post('/api/auth/login', login);
app.get('/api/users/public/:id', require('./src/controllers/authController').getPublicProfile);

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
adminRouter.delete('/users/:id', adminController.deleteUser);
adminRouter.get('/settings', adminController.getSettings);
adminRouter.post('/settings', adminController.updateSettings);
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

adminRouter.get('/dictionary/stats', adminController.getDictionaryStats);
adminRouter.get('/dictionary', adminController.getDictionary);
adminRouter.post('/dictionary', adminController.addWord);
adminRouter.post('/dictionary/import', upload.single('file'), adminController.importWords);
adminRouter.delete('/dictionary/:id', adminController.deleteWord);
adminRouter.get('/history', adminController.getMatchHistory);

// Suggestions
adminRouter.get('/suggestions', adminController.getSuggestions);
adminRouter.post('/suggestions/approve-bulk', adminController.bulkApproveSuggestions);
adminRouter.post('/suggestions/reject-bulk', adminController.bulkRejectSuggestions);
adminRouter.post('/suggestions/:id/approve', adminController.approveSuggestion);
adminRouter.delete('/suggestions/:id', adminController.deleteSuggestion);

// Contact Messages
adminRouter.get('/messages', async (req, res) => {
    try {
        const { getContactMessages } = require('./src/data/database_mysql');
        const messages = await getContactMessages();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

adminRouter.put('/messages/:id/status', async (req, res) => {
    try {
        const { updateContactMessageStatus } = require('./src/data/database_mysql');
        const { status } = req.body;
        await updateContactMessageStatus(req.params.id, status);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

adminRouter.delete('/messages/:id', async (req, res) => {
    try {
        const { deleteContactMessage } = require('./src/data/database_mysql');
        await deleteContactMessage(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Stats (Logic lives here to access 'rooms')
// Admin Stats (Logic lives here to access 'rooms')
adminRouter.get('/stats', async (req, res) => {
    try {
        const stats = await getAdminStats();
        const { totalUsers, totalGames, totalWords, topUsers } = stats;

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
        // Inject userId into details for history tracking
        if (details.players && details.players.length > 0) {
            details.players[0].userId = req.user.id;
        }
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
    console.log(`[History API] Request received for user ${req.user.id}`);
    try {
        const { getUserMatches } = require('./src/data/database_mysql');
        console.log(`[History API] Fetching matches from DB...`);
        const history = await getUserMatches(req.user.id);
        console.log(`[History API] Found ${history.length} matches. Sending response.`);
        res.json(history);
    } catch (err) {
        console.error('History API Error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Contact Us (Public)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, contact_info, message } = req.body;
        if (!name || !contact_info || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const { createContactMessage } = require('./src/data/database_mysql');
        await createContactMessage(name, contact_info, message);
        res.json({ success: true });
    } catch (err) {
        console.error('Contact API Error:', err);
        res.status(500).json({ error: 'Failed to send message' });
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
app.get(/.*/, (req, res) => {
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
const onlineUsers = new Map(); // socket.id -> { id, username, isGuest }

// CONSTANTS
const ARABIC_LETTERS = [
    "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"
];

io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`User connected: ${socket.id} (Guest: ${user.isGuest}, User: ${user.username || 'Anonymous'})`);

    // Track Online User/Visitor
    onlineUsers.set(socket.id, {
        socketId: socket.id,
        userId: user.id || null,
        username: user.username || null,
        isGuest: user.isGuest
    });

    // Broadcast updated list to all clients
    broadcastOnlineCounts();
    broadcastRoomsList();

    // Create Room
    socket.on("create_room", (config, callback) => {
        if (socket.user.isGuest) {
            if (callback) callback({ error: "يجب تسجيل الدخول لإنشاء غرفة" });
            return;
        }
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
        if (socket.user.isGuest) {
            if (callback) callback({ error: "يجب تسجيل الدخول للانضمام لغرفة" });
            return;
        }
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

    // Sync Answers - Updates drafts without closing round
    socket.on("sync_answers", ({ roomId, answers }) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== "playing") return;

        // Initialize answers for this round if not exists
        if (!room.answers[room.currentRound]) {
            room.answers[room.currentRound] = {};
        }

        // Update draft answers
        room.answers[room.currentRound][socket.id] = answers;
    });

    // Submit Answers - First submission closes round for everyone!
    socket.on("submit_answers", ({ roomId, answers }) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== "playing") {
            console.log(`[Submit] Invalid room or status. RoomId: ${roomId}, RoomExists: ${!!room}, Status: ${room?.status}`);
            return;
        }

        console.log(`[Submit] FIRST player ${socket.id} submitted! Closing round for everyone.`);

        // Initialize answers for this round if not exists
        if (!room.answers[room.currentRound]) {
            room.answers[room.currentRound] = {};
        }

        // Store submitter's answers
        room.answers[room.currentRound][socket.id] = answers;

        // Collect empty answers from all other players who didn't submit yet
        room.players.forEach(p => {
            if (!room.answers[room.currentRound][p.id]) {
                room.answers[room.currentRound][p.id] = {}; // Empty answers
                console.log(`[Submit] Player ${p.id} didn't submit - recording empty answers`);
            }
        });

        console.log(`[Submit] Finishing round immediately with ${Object.keys(room.answers[room.currentRound]).length} players`);

        // Finish round immediately (don't wait for others)
        finishRound(roomId);
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

    socket.on("close_room", ({ roomId }) => {
        const room = rooms.get(roomId);

        if (!room) {
            return socket.emit('error', { message: 'Room not found' });
        }

        // Only owner can close
        if (room.ownerUserId !== socket.user.id) {
            return socket.emit('error', { message: 'Only owner can close room' });
        }

        console.log(`[Close Room] Owner ${socket.user.username} closed room ${roomId}`);

        // Notify all players
        io.to(roomId).emit('room_closed', { roomId });

        // Delete room
        rooms.delete(roomId);
        broadcastRoomsList();
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        handleDisconnect(socket);

        // Remove from online users
        onlineUsers.delete(socket.id);
        broadcastOnlineCounts();
        broadcastRoomsList();
    });
});

function broadcastOnlineCounts() {
    const users = Array.from(onlineUsers.values());
    const playersCount = users.filter(u => !u.isGuest).length;
    const visitorsCount = users.filter(u => u.isGuest).length;

    io.emit("online_players", playersCount);
    io.emit("online_visitors", visitorsCount);
    io.emit("online_users", users);
}

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
        name: room.config.name,
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

    // Allow rejoin even if game is in progress (for reconnection)
    const existingPlayer = room.players.find(p => p.userId === socket.user.id);

    if (existingPlayer) {
        // Player is rejoining - update their connection status
        existingPlayer.id = socket.id;
        existingPlayer.connected = true;
        delete existingPlayer.disconnectedAt;

        // If this user was the owner, update the ownerId to the new socket ID
        if (room.ownerUserId === socket.user.id) {
            room.ownerId = socket.id;
            console.log(`[Join Room] Owner ${socket.user.username} reconnected. Updated ownerId to ${socket.id}`);
        }

        socket.join(roomId);
        console.log(`[Join Room] Player ${socket.user.username} rejoined room ${roomId}`);
    } else {
        // New player joining
        if (room.status !== "lobby") {
            if (callback) callback({ error: "Game already started" });
            return;
        }

        const player = {
            id: socket.id,
            userId: socket.user.id,
            name: socket.user.username,
            username: socket.user.username,
            profile_pic: socket.user.profile_pic,
            wins: socket.user.wins || 0,
            losses: socket.user.losses || 0,
            score: 0,
            connected: true
        };
        room.players.push(player);
        room.scores[socket.id] = 0;
        socket.join(roomId);
        console.log(`[Join Room] New player ${socket.user.username} joined room ${roomId}`);
    }

    // Update room activity timestamp
    room.lastActivity = Date.now();

    emitRoomUpdate(roomId);

    if (callback) callback({ roomId, config: room.config, players: room.players, ownerId: room.ownerId, ownerUserId: room.ownerUserId, status: room.status });
}

function startRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const letter = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    room.currentLetter = letter;
    room.status = "playing";

    emitRoomUpdate(roomId);

    console.log(`[StartRound] Round ${room.currentRound} for room ${roomId}, letter: ${letter}`);

    io.to(roomId).emit("game_started", {
        currentRound: room.currentRound,
        letter,
        categories: room.config.categories,
        timeLimit: null // No time limit - first to submit wins!
    });

    // ❌ Removed auto-finish timer
}

async function finishRound(roomId) {
    const room = rooms.get(roomId);
    if (!room || room.status !== "playing") {
        console.log(`[FinishRound] Cannot finish - room not playing. RoomId: ${roomId}, RoomExists: ${!!room}, Status: ${room?.status}`);
        return;
    }

    console.log(`[FinishRound] Starting for room ${roomId}, round ${room.currentRound}`);

    if (room.roundTimer) clearTimeout(room.roundTimer);
    room.status = "results";

    const currentRoundAnswers = room.answers[room.currentRound] || {};
    console.log(`[FinishRound] Calculating scores for ${Object.keys(currentRoundAnswers).length} submissions`);

    const roundScoresv = await calculateScores(room, currentRoundAnswers);

    room.players.forEach(p => {
        p.score = room.scores[p.id];
    });

    const isFinalRound = room.currentRound >= room.config.rounds;

    console.log(`[FinishRound] Emitting round_results to room ${roomId}. Round: ${room.currentRound}, IsFinal: ${isFinalRound}`);

    io.to(roomId).emit("round_results", {
        round: room.currentRound,
        letter: room.currentLetter,
        results: roundScoresv,
        players: room.players,
        isFinal: isFinalRound,
        nextRoundIn: isFinalRound ? null : 30
    });

    if (isFinalRound) {
        console.log(`[FinishRound] Final round completed, finishing game`);
        finishGame(roomId);
    } else {
        console.log(`[FinishRound] Scheduling next round in 30 seconds`);
        room.nextRoundTimer = setTimeout(() => {
            console.log(`[FinishRound] Auto-starting next round for room ${roomId}`);
            room.currentRound++;
            startRound(roomId);
        }, 30 * 1000);
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
    try {
        console.log(`[CalculateScores] Starting for room ${room.roomId}, round ${room.currentRound}`);
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
                    try {
                        const exists = await checkWord(rawVal, cat, room.currentLetter);
                        if (!exists) {
                            results[p.id].categories[cat] = { value: rawVal, score: 0, type: "red" };
                        } else {
                            if (!valuesMap[normalizedVal]) valuesMap[normalizedVal] = [];
                            valuesMap[normalizedVal].push(p.id);
                        }
                    } catch (dbError) {
                        console.error(`[CalculateScores] DB Error checking word "${rawVal}":`, dbError.message);
                        // Default to accepting the word if DB fails
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

        console.log(`[CalculateScores] Completed successfully for room ${room.roomId}`);
        return results;
    } catch (error) {
        console.error(`[CalculateScores] CRITICAL ERROR:`, error);
        // Return empty results to prevent crash
        const results = {};
        room.players.forEach(p => {
            results[p.id] = { total: 0, categories: {} };
        });
        return results;
    }
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
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            // Mark player as disconnected instead of removing
            player.connected = false;
            player.disconnectedAt = Date.now();

            console.log(`Player ${player.name} disconnected from room ${roomId}`);

            // Update room activity
            room.lastActivity = Date.now();

            // Emit update to show disconnected status
            emitRoomUpdate(roomId);

            // Don't delete room - it persists for rejoin
            // Room will be cleaned up by periodic cleanup task if truly abandoned
        }
    }
}

// Periodic cleanup of abandoned rooms
setInterval(() => {
    const now = Date.now();
    const ROOM_TIMEOUT = 60 * 60 * 1000; // 1 hour

    for (const [roomId, room] of rooms.entries()) {
        const allDisconnected = room.players.every(p => !p.connected);
        const inactive = (now - room.lastActivity) > ROOM_TIMEOUT;

        if (allDisconnected && inactive) {
            console.log(`[Cleanup] Removing abandoned room: ${roomId}`);
            rooms.delete(roomId);
            broadcastRoomsList();
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes

// Close Room event (owner only)
io.on("connection", (socket) => {
    // ... existing connection handlers ...

    socket.on("close_room", ({ roomId }) => {
        const room = rooms.get(roomId);

        if (!room) {
            return socket.emit('error', { message: 'Room not found' });
        }

        // Only owner can close
        if (room.ownerUserId !== socket.user.id) {
            return socket.emit('error', { message: 'Only owner can close room' });
        }

        console.log(`[Close Room] Owner ${socket.user.username} closed room ${roomId}`);

        // Notify all players
        io.to(roomId).emit('room_closed', { roomId });

        // Delete room
        rooms.delete(roomId);
        broadcastRoomsList();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Autobees Backend running on port ${PORT}`);
});
