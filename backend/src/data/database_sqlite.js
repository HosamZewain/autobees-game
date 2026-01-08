const Database = require('better-sqlite3');
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, '..', 'autobees.sqlite');
const db = new Database(dbPath);

function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[أإآ]/g, 'ا') // Normalize Alifs
        .replace(/ة/g, 'ه')     // Normalize Ta Marbuta
        .replace(/ى/g, 'ي');    // Normalize Alef Maqsura
}

function initDatabase() {
    try {
        console.log('Initializing SQLite Database...');

        // 1. Users Table
        db.exec(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            total_score INTEGER DEFAULT 0,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1,
            dob TEXT,
            gender TEXT,
            profile_pic TEXT
        )`);

        // 2. Settings Table
        db.exec(`CREATE TABLE IF NOT EXISTS settings (
            \`key\` TEXT PRIMARY KEY,
            value TEXT
        )`);

        // Default Settings
        const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (\`key\`, value) VALUES (?, ?)');
        insertSetting.run('game_duration', '60');
        insertSetting.run('rounds_count', '3');
        insertSetting.run('strict_mode', 'false');

        // 3. Dictionary Table
        db.exec(`CREATE TABLE IF NOT EXISTS dictionary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            category TEXT NOT NULL,
            letter TEXT,
            is_approved INTEGER DEFAULT 1,
            UNIQUE(word, category)
        )`);

        // 4. Matches Table
        db.exec(`CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id TEXT,
            played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            details TEXT
        )`);

        // 5. Pending Words Table
        db.exec(`CREATE TABLE IF NOT EXISTS pending_words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            category TEXT NOT NULL,
            letter TEXT NOT NULL,
            suggested_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (suggested_by) REFERENCES users(id) ON DELETE SET NULL,
            UNIQUE(word, category)
        )`);

        // 6. Match Participants Table
        db.exec(`CREATE TABLE IF NOT EXISTS match_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            score INTEGER DEFAULT 0,
            is_winner INTEGER DEFAULT 0,
            FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        // 7. Contact Messages Table
        db.exec(`CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_info TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('Database tables ready.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

// Initialize on load
initDatabase();

// --- Data Access Helpers ---

function getUserByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function getUserByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function getUserById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function createUser(username, email, passwordHash, gender, profilePic, role = 'user') {
    const result = db.prepare(
        'INSERT INTO users (username, email, password_hash, gender, profile_pic, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(username, email, passwordHash, gender, profilePic, role);

    return { id: result.lastInsertRowid, username, email, role, wins: 0, losses: 0, total_score: 0, gender, profile_pic: profilePic };
}

function updateUserStats(id, won, scoreToAdd) {
    const winInc = won ? 1 : 0;
    const lossInc = won ? 0 : 1;
    db.prepare(
        'UPDATE users SET wins = wins + ?, losses = losses + ?, total_score = total_score + ? WHERE id = ?'
    ).run(winInc, lossInc, scoreToAdd, id);
}

function updateUserProfile(id, username, passwordHash, dob, gender, profile_pic) {
    let query = 'UPDATE users SET username = ?, dob = ?, gender = ?, profile_pic = ?';
    let params = [username, dob, gender, profile_pic];

    if (passwordHash) {
        query += ', password_hash = ?';
        params.push(passwordHash);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);

    return getUserById(id);
}

// --- Admin Helpers ---

function getTopPlayers(limit = 10) {
    const lim = parseInt(limit) || 10;
    return db.prepare(
        'SELECT username, total_score, profile_pic FROM users ORDER BY total_score DESC LIMIT ?'
    ).all(lim);
}

function getAllUsers() {
    return db.prepare('SELECT id, username, email, wins, losses, total_score, role, is_active FROM users ORDER BY id DESC').all();
}

function updateUserStatus(id, isActive) {
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);
}

function getSettings() {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    return settings;
}

function updateSetting(key, value) {
    db.prepare('REPLACE INTO settings (`key`, value) VALUES (?, ?)').run(key, value);
}

function adminUpdateUser(id, { username, email, password, role, wins, losses, total_score }) {
    if (password) {
        db.prepare(
            "UPDATE users SET username=?, email=?, password_hash=?, role=?, wins=?, losses=?, total_score=? WHERE id=?"
        ).run(username, email, password, role, wins, losses, total_score, id);
    } else {
        db.prepare(
            "UPDATE users SET username=?, email=?, role=?, wins=?, losses=?, total_score=? WHERE id=?"
        ).run(username, email, role, wins, losses, total_score, id);
    }
}

function addWord(word, category, letter = null) {
    const trimmedWord = word.trim();
    const normalizedWord = normalizeArabic(trimmedWord);
    const targetLetter = letter || normalizedWord.charAt(0);
    const normalizedLetter = normalizeArabic(targetLetter);

    const result = db.prepare(
        'INSERT OR IGNORE INTO dictionary (word, category, letter) VALUES (?, ?, ?)'
    ).run(normalizedWord, category, normalizedLetter);

    return { id: result.lastInsertRowid };
}

function getDictionary(category = null, letter = null, page = 1, limit = 50) {
    let baseQuery = " FROM dictionary WHERE 1=1";
    let params = [];

    if (category && category !== 'undefined' && category !== '') {
        baseQuery += " AND category = ?";
        params.push(category);
    }

    if (letter && letter !== 'undefined' && letter !== '') {
        baseQuery += " AND letter = ?";
        params.push(letter);
    }

    // Get Total Count
    const countRow = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(...params);
    const total = countRow.count;

    // Get Data
    const offset = (page - 1) * limit;
    const sql = `SELECT * ${baseQuery} ORDER BY word ASC LIMIT ? OFFSET ?`;
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);

    const paginatedRows = db.prepare(sql).all(...params, limitInt, offsetInt);

    return {
        data: paginatedRows,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
}

function deleteWord(id) {
    db.prepare('DELETE FROM dictionary WHERE id = ?').run(id);
}

function logMatch(roomId, details) {
    const result = db.prepare('INSERT INTO matches (room_id, details) VALUES (?, ?)').run(
        roomId,
        JSON.stringify(details)
    );
    const matchId = result.lastInsertRowid;

    if (details.players && Array.isArray(details.players)) {
        const stmt = db.prepare(
            'INSERT INTO match_participants (match_id, user_id, score, is_winner) VALUES (?, ?, ?, ?)'
        );

        for (const p of details.players) {
            if (p.userId) {
                const win = p.isWinner ? 1 : 0;
                stmt.run(matchId, p.userId, p.score, win);
            }
        }
    }
}

function getMatches(limit = 50) {
    const lim = parseInt(limit) || 50;
    return db.prepare('SELECT * FROM matches ORDER BY played_at DESC LIMIT ?').all(lim);
}

function getUserMatches(userId) {
    const query = `
        SELECT mp.*, m.played_at, m.room_id 
        FROM match_participants mp
        JOIN matches m ON mp.match_id = m.id
        WHERE mp.user_id = ?
        ORDER BY m.played_at DESC
    `;
    return db.prepare(query).all(userId);
}

// --- Word Suggestion Helpers ---

function suggestWord(word, category, letter, userId) {
    try {
        const normalizedWord = normalizeArabic(word.trim());
        const normalizedLetter = normalizeArabic(letter);
        console.log(`[Suggestion] Processing: "${normalizedWord}" (${category}) for user ${userId}`);

        db.prepare(
            'INSERT OR IGNORE INTO pending_words (word, category, letter, suggested_by) VALUES (?, ?, ?, ?)'
        ).run(normalizedWord, category, normalizedLetter, userId || null);

        console.log(`[Suggestion] Recorded: "${normalizedWord}"`);
    } catch (e) {
        console.error('[Suggestion] Error:', e.message);
    }
}

function getPendingWords() {
    return db.prepare(`
        SELECT p.*, u.username as suggested_by_name 
        FROM pending_words p 
        LEFT JOIN users u ON p.suggested_by = u.id 
        ORDER BY p.created_at DESC
    `).all();
}

function approveWord(id) {
    const row = db.prepare('SELECT * FROM pending_words WHERE id = ?').get(id);
    if (!row) return;

    const { word, category, letter } = row;
    addWord(word, category, letter);
    deletePendingWord(id);
}

function deletePendingWord(id) {
    db.prepare('DELETE FROM pending_words WHERE id = ?').run(id);
}

function checkWord(word, category, letter) {
    const normalizedWord = normalizeArabic(word.trim());
    const normalizedLetter = normalizeArabic(letter);

    const row = db.prepare(
        'SELECT * FROM dictionary WHERE word = ? AND category = ? AND letter = ? AND is_approved = 1'
    ).get(normalizedWord, category, normalizedLetter);

    const isValid = !!row;
    console.log(`[Validation] "${normalizedWord}" in "${category}" (${normalizedLetter}): ${isValid}`);
    return isValid;
}

function createContactMessage(name, contact_info, message) {
    db.prepare(
        'INSERT INTO contact_messages (name, contact_info, message) VALUES (?, ?, ?)'
    ).run(name, contact_info, message);
}

function getContactMessages() {
    return db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
}

function updateContactMessageStatus(id, status) {
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
}

function deleteContactMessage(id) {
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
}

module.exports = {
    db,
    getUserByUsername,
    getUserByEmail,
    getUserById,
    createUser,
    updateUserStats,
    updateUserProfile,
    getAllUsers,
    getTopPlayers,
    updateUserStatus,
    adminUpdateUser,
    getSettings,
    updateSetting,
    addWord,
    getDictionary,
    deleteWord,
    logMatch,
    getUserMatches,
    getMatches,
    checkWord,
    suggestWord,
    getPendingWords,
    approveWord,
    deletePendingWord,
    createContactMessage,
    getContactMessages,
    updateContactMessageStatus,
    deleteContactMessage
};
