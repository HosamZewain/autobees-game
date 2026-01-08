require('dotenv').config();
const mysql = require('mysql2/promise');

// Create the connection pool
let pool;

async function initializePool() {
    try {
        // 1. Connect without DB to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        const dbName = process.env.DB_NAME || 'autobees';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();

        // 2. Create Pool with DB
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        initDatabase();
    } catch (err) {
        console.error('MySQL Connection Error:', err.message);
    }
}

function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[أإآ]/g, 'ا') // Normalize Alifs
        .replace(/ة/g, 'ه')     // Normalize Ta Marbuta
        .replace(/ى/g, 'ي');    // Normalize Alef Maqsura
}

// ... helper object ...
const db = {
    async query(sql, params) {
        if (!pool) throw new Error('Database not initialized');
        const [results] = await pool.execute(sql, params);
        return results;
    },
    async run(sql, params) {
        if (!pool) throw new Error('Database not initialized');
        const [results] = await pool.execute(sql, params);
        return { lastID: results.insertId, changes: results.affectedRows };
    },
    async get(sql, params) {
        if (!pool) throw new Error('Database not initialized');
        const [rows] = await pool.execute(sql, params);
        return rows[0];
    },
    async all(sql, params) {
        if (!pool) throw new Error('Database not initialized');
        const [rows] = await pool.execute(sql, params);
        return rows;
    },
    async checkWord(word, category, letter) {
        if (!pool) throw new Error('Database not initialized');
        const normWord = normalizeArabic(word);
        // Check dictionary for approved words
        const [rows] = await pool.execute(
            'SELECT id FROM dictionary WHERE word = ? AND category = ?',
            [normWord, category]
        );
        return rows.length > 0;
    }
};

initializePool();

async function initDatabase() {
    try {
        console.log('Initializing MySQL Database...');

        // 1. Users Table
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(255) UNIQUE,
            email VARCHAR(255) UNIQUE,
            password_hash VARCHAR(255),
            wins INT DEFAULT 0,
            losses INT DEFAULT 0,
            total_score INT DEFAULT 0,
            role VARCHAR(50) DEFAULT 'user',
            is_active TINYINT DEFAULT 1,
            dob DATE,
            gender VARCHAR(20),
            profile_pic TEXT
        )`);

        // Migration for email if needed
        try {
            await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE");
        } catch (e) { }

        // 2. Settings Table
        await pool.query(`CREATE TABLE IF NOT EXISTS settings (
            \`key\` VARCHAR(255) PRIMARY KEY,
            value TEXT
        )`);

        // Default Settings
        await pool.query(`INSERT IGNORE INTO settings (\`key\`, value) VALUES 
            ('game_duration', '60'),
            ('rounds_count', '3'),
            ('strict_mode', 'false')
        `);

        // 3. Dictionary Table
        await pool.query(`CREATE TABLE IF NOT EXISTS dictionary (
            id INT PRIMARY KEY AUTO_INCREMENT,
            word VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            letter VARCHAR(1),
            is_approved TINYINT DEFAULT 1,
            UNIQUE(word, category)
        )`);

        // Add 'letter' column if it doesn't exist (Migration for existing DB)
        try {
            await pool.query("ALTER TABLE dictionary ADD COLUMN letter VARCHAR(1)");
        } catch (e) {
            // Ignore error if column already exists
        }

        // 4. Normalize Existing Dictionary Data
        try {
            const [rows] = await pool.execute('SELECT id, word, letter FROM dictionary');
            for (const row of rows) {
                const normWord = normalizeArabic(row.word);
                const normLetter = normalizeArabic(row.letter || (normWord ? normWord.charAt(0) : ''));
                if (normWord !== row.word || normLetter !== row.letter) {
                    await pool.execute('UPDATE dictionary SET word = ?, letter = ? WHERE id = ?', [normWord, normLetter, row.id]);
                }
            }
        } catch (e) {
            console.error('Error migrating dictionary data:', e.message);
        }

        // 5. User Profile & Admin Fields Migration
        const columns = [
            "ADD COLUMN dob DATE",
            "ADD COLUMN gender VARCHAR(20)",
            "ADD COLUMN profile_pic TEXT",
            "ADD COLUMN role VARCHAR(50) DEFAULT 'user'",
            "ADD COLUMN is_active TINYINT DEFAULT 1"
        ];

        for (const col of columns) {
            try {
                await pool.query(`ALTER TABLE users ${col}`);
            } catch (e) {
                // Ignore if column exists
            }
        }

        await pool.query(`CREATE TABLE IF NOT EXISTS matches (
            id INT PRIMARY KEY AUTO_INCREMENT,
            room_id VARCHAR(50),
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            details JSON
        )`);

        // 6. Pending Words Table
        await pool.query(`CREATE TABLE IF NOT EXISTS pending_words (
            id INT PRIMARY KEY AUTO_INCREMENT,
            word VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            letter VARCHAR(1) NOT NULL,
            suggested_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (suggested_by) REFERENCES users(id) ON DELETE SET NULL,
            UNIQUE(word, category)
        )`);

        // 7. Match Participants Table (For History)
        await pool.query(`CREATE TABLE IF NOT EXISTS match_participants (
            id INT PRIMARY KEY AUTO_INCREMENT,
            match_id INT NOT NULL,
            user_id INT NOT NULL,
            score INT DEFAULT 0,
            is_winner TINYINT DEFAULT 0,
            FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        // 8. Contact Messages Table
        await pool.query(`CREATE TABLE IF NOT EXISTS contact_messages (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            contact_info VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('Database tables ready.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

// Call init on start handled by initializePool
// initDatabase();

// --- Data Access Helpers ---

async function getUserByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
}

async function getUserByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}

async function getUserById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
}

async function createUser(username, email, passwordHash, gender, profilePic, role = 'user') {
    const [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash, gender, profile_pic, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, passwordHash, gender, profilePic, role]
    );
    return { id: result.insertId, username, email, role, wins: 0, losses: 0, total_score: 0, gender, profile_pic: profilePic };
}

async function updateUserStats(id, won, scoreToAdd) {
    const winInc = won ? 1 : 0;
    const lossInc = won ? 0 : 1;
    await pool.execute(
        'UPDATE users SET wins = wins + ?, losses = losses + ?, total_score = total_score + ? WHERE id = ?',
        [winInc, lossInc, scoreToAdd, id]
    );
}

async function updateUserProfile(id, username, passwordHash, dob, gender, profile_pic) {
    let query = 'UPDATE users SET username = ?, dob = ?, gender = ?, profile_pic = ?';
    let params = [username, dob, gender, profile_pic];

    if (passwordHash) {
        query += ', password_hash = ?';
        params.push(passwordHash);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    // Return updated user data
    return getUserById(id);
}

// --- Admin Helpers ---

async function getTopPlayers(limit = 10) {
    const lim = parseInt(limit) || 10;
    const [rows] = await pool.query(
        'SELECT username, total_score, profile_pic FROM users ORDER BY total_score DESC LIMIT ' + lim
    );
    return rows;
}

async function getAllUsers() {
    const [rows] = await pool.execute('SELECT id, username, email, wins, losses, total_score, role, is_active FROM users ORDER BY id DESC');
    return rows;
}

async function updateUserStatus(id, isActive) {
    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
}

async function getSettings() {
    const [rows] = await pool.execute('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    return settings;
}

async function updateSetting(key, value) {
    await pool.execute('REPLACE INTO settings (`key`, value) VALUES (?, ?)', [key, value]);
}

async function adminUpdateUser(id, { username, email, password, role, wins, losses, total_score }) {
    let query = "UPDATE users SET username=?, email=?, role=?, wins=?, losses=?, total_score=? WHERE id=?";
    let params = [username, email, role, wins, losses, total_score, id];

    if (password) {
        query = "UPDATE users SET username=?, email=?, password_hash=?, role=?, wins=?, losses=?, total_score=? WHERE id=?";
        params = [username, email, password, role, wins, losses, total_score, id];
    }

    await pool.execute(query, params);
}

async function addWord(word, category, letter = null) {
    const trimmedWord = word.trim();
    const normalizedWord = normalizeArabic(trimmedWord);
    // Auto-detect letter if not provided
    const targetLetter = letter || normalizedWord.charAt(0);
    const normalizedLetter = normalizeArabic(targetLetter);

    const [result] = await pool.execute(
        'INSERT IGNORE INTO dictionary (word, category, letter) VALUES (?, ?, ?)',
        [normalizedWord, category, normalizedLetter]
    );
    return { id: result.insertId };
}

async function getDictionary(category = null, letter = null, page = 1, limit = 50) {
    let baseQuery = "FROM dictionary WHERE 1=1";
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
    const [countRows] = await pool.execute(`SELECT COUNT(*) as count ${baseQuery}`, params);
    const total = countRows[0].count;

    // Get Data
    const offset = (page - 1) * limit;
    const sql = `SELECT * ${baseQuery} ORDER BY word ASC LIMIT ? OFFSET ?`;
    // MySQL2 params for limit/offset need to be integers, or use direct injection if safe (but here we just push)
    // Note: limit/offset parameters in prepared statements can be tricky in some drivers, 
    // but mysql2 usually handles numbers correctly.
    // Correction: modifying param passing to ensure Integers are respected or safe string usage
    // Safe approach: parseInt
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);

    // Re-run with clean integers
    console.log('Executing Pagination SQL:', sql);
    console.log('Params:', [...params, limitInt, offsetInt]);
    const [paginatedRows] = await pool.query(sql, [...params, limitInt, offsetInt]);

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

async function deleteWord(id) {
    await pool.execute('DELETE FROM dictionary WHERE id = ?', [id]);
}

async function logMatch(roomId, details) {
    const [result] = await pool.execute('INSERT INTO matches (room_id, details) VALUES (?, ?)', [roomId, JSON.stringify(details)]);
    const matchId = result.insertId;

    // Log participants for individual history
    if (details.players && Array.isArray(details.players)) {
        for (const p of details.players) {
            // Check if player has a userId (registered user)
            // If details.players only has name/score, we need to ensure we have userId.
            // In finishGame (index.js), we constructed 'rankedPlayers' which has 'userId'.
            // In logMatch call (index.js), we passed 'rankedPlayers.map(p => ({name: p.name, score: p.score}))'
            // We need to pass userId in logMatch to properly link history!
            // assuming we update index.js to pass userId in details.players

            if (p.userId) {
                const isWinner = (p.score == details.scores[p.id]) && (p.score > 0) && (p.score == Math.max(...details.players.map(pl => pl.score)));
                // Simplified winner check: passed in details or calculated? 
                // index.js calculates winner. Let's rely on score for now or just save raw.
                // Better: index.js should flag winner.
                const win = p.isWinner ? 1 : 0;

                await pool.execute(
                    'INSERT INTO match_participants (match_id, user_id, score, is_winner) VALUES (?, ?, ?, ?)',
                    [matchId, p.userId, p.score, win]
                );
            }
        }
    }
}

async function getMatches(limit = 50) {
    const lim = parseInt(limit) || 50;
    const [rows] = await pool.query('SELECT * FROM matches ORDER BY played_at DESC LIMIT ' + lim);
    return rows;
}

async function getUserMatches(userId) {
    // Join matches to get date and room info
    const query = `
        SELECT mp.*, m.played_at, m.room_id 
        FROM match_participants mp
        JOIN matches m ON mp.match_id = m.id
        WHERE mp.user_id = ?
        ORDER BY m.played_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

// --- Word Suggestion Helpers ---

async function suggestWord(word, category, letter, userId) {
    try {
        const normalizedWord = normalizeArabic(word.trim());
        const normalizedLetter = normalizeArabic(letter);
        console.log(`[Suggestion] Processing: "${normalizedWord}" (${category}) for user ${userId}`);

        await pool.execute(
            'INSERT IGNORE INTO pending_words (word, category, letter, suggested_by) VALUES (?, ?, ?, ?)',
            [normalizedWord, category, normalizedLetter, userId || null]
        );
        console.log(`[Suggestion] Recorded: "${normalizedWord}"`);
    } catch (e) {
        console.error('[Suggestion] Error:', e.message);
    }
}

async function getPendingWords() {
    const rows = await db.query(`
        SELECT p.*, u.username as suggested_by_name 
        FROM pending_words p 
        LEFT JOIN users u ON p.suggested_by = u.id 
        ORDER BY p.created_at DESC
    `);
    return rows;
}

async function approveWord(id) {
    // 1. Get word details
    const [rows] = await pool.execute('SELECT * FROM pending_words WHERE id = ?', [id]);
    if (rows.length === 0) return;

    const { word, category, letter } = rows[0];

    // 2. Add to dictionary
    await addWord(word, category, letter);

    // 3. Delete from pending
    await deletePendingWord(id);
}

async function deletePendingWord(id) {
    await pool.execute('DELETE FROM pending_words WHERE id = ?', [id]);
}

async function checkWord(word, category, letter) {
    const normalizedWord = normalizeArabic(word.trim());
    const normalizedLetter = normalizeArabic(letter);

    const [rows] = await pool.execute(
        'SELECT * FROM dictionary WHERE word = ? AND category = ? AND letter = ? AND is_approved = 1',
        [normalizedWord, category, normalizedLetter]
    );
    const isValid = rows.length > 0;
    console.log(`[Validation] "${normalizedWord}" in "${category}" (${normalizedLetter}): ${isValid}`);
    return isValid;
}

async function createContactMessage(name, contact_info, message) {
    await pool.execute(
        'INSERT INTO contact_messages (name, contact_info, message) VALUES (?, ?, ?)',
        [name, contact_info, message]
    );
}

async function getContactMessages() {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return rows;
}

async function updateContactMessageStatus(id, status) {
    await pool.execute('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
}

async function deleteContactMessage(id) {
    await pool.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
}

// Maintain compatibility with existing code that might use db.something
module.exports = {
    db,
    pool,
    initializePool,
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
