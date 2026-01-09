const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'autobees_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable multiple statements for initialization script if needed, though best avoided
    multipleStatements: true
});

// Helper for normalizing Arabic text (Same as before)
function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[أإآ]/g, 'ا') // Normalize Alifs
        .replace(/ة/g, 'ه')     // Normalize Ta Marbuta
        .replace(/ى/g, 'ي');    // Normalize Alef Maqsura
}

async function initDatabase() {
    try {
        console.log('Initializing MySQL Database...');

        // Use a connection to ensure we are connected
        const connection = await pool.getConnection();

        try {
            // 1. Users Table
            await connection.query(`CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE,
                email VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255),
                wins INT DEFAULT 0,
                losses INT DEFAULT 0,
                total_score INT DEFAULT 0,
                role VARCHAR(50) DEFAULT 'user',
                is_active TINYINT DEFAULT 1,
                dob VARCHAR(50),
                gender VARCHAR(50),
                profile_pic TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // 2. Settings Table
            await connection.query(`CREATE TABLE IF NOT EXISTS settings (
                \`key\` VARCHAR(100) PRIMARY KEY,
                value TEXT
            )`);

            // Default Settings (using INSERT IGNORE)
            await connection.execute('INSERT IGNORE INTO settings (\`key\`, value) VALUES (?, ?)', ['game_duration', '60']);
            await connection.execute('INSERT IGNORE INTO settings (\`key\`, value) VALUES (?, ?)', ['rounds_count', '3']);
            await connection.execute('INSERT IGNORE INTO settings (\`key\`, value) VALUES (?, ?)', ['strict_mode', 'false']);

            // 3. Dictionary Table
            await connection.query(`CREATE TABLE IF NOT EXISTS dictionary (
                id INT AUTO_INCREMENT PRIMARY KEY,
                word VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                letter VARCHAR(10),
                is_approved TINYINT DEFAULT 1,
                UNIQUE KEY unique_word_cat (word, category)
            )`);

            // 4. Matches Table
            await connection.query(`CREATE TABLE IF NOT EXISTS matches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id VARCHAR(100),
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                details JSON
            )`);

            // 5. Pending Words Table
            await connection.query(`CREATE TABLE IF NOT EXISTS pending_words (
                id INT AUTO_INCREMENT PRIMARY KEY,
                word VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                letter VARCHAR(10) NOT NULL,
                suggested_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (suggested_by) REFERENCES users(id) ON DELETE SET NULL,
                UNIQUE KEY unique_pending (word, category)
            )`);

            // 6. Match Participants Table
            await connection.query(`CREATE TABLE IF NOT EXISTS match_participants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id INT NOT NULL,
                user_id INT NOT NULL,
                score INT DEFAULT 0,
                is_winner TINYINT DEFAULT 0,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`);

            // 7. Contact Messages Table
            await connection.query(`CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact_info VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            console.log('Database tables ready.');

        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error initializing MySQL database:', err);
    }
}

// Initialize on load
initDatabase();

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

    return {
        id: result.insertId,
        username,
        email,
        role,
        wins: 0,
        losses: 0,
        total_score: 0,
        gender,
        profile_pic: profilePic
    };
}

async function updateUserStats(id, won, scoreToAdd) {
    const winInc = won ? 1 : 0;
    const lossInc = won ? 0 : 1;
    await pool.execute(
        'UPDATE users SET wins = wins + ?, losses = losses + ?, total_score = total_score + ? WHERE id = ?',
        [winInc, lossInc, scoreToAdd, id]
    );
}

async function updateUserProfile(id, username, email, passwordHash, dob, gender, profile_pic) {
    let query = 'UPDATE users SET username = ?, email = ?, dob = ?, gender = ?, profile_pic = ?';
    let params = [username, email, dob, gender, profile_pic];

    if (passwordHash) {
        query += ', password_hash = ?';
        params.push(passwordHash);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    return await getUserById(id);
}

// --- Admin Helpers ---

async function getTopPlayers(limit = 10) {
    const lim = parseInt(limit) || 10;
    // MySQL requires LIMIT params to be integers, but pool.execute handles placeholders fine, usually.
    // Sometimes it's safer to interpolate for LIMIT in simple drivers, but mysql2 supports prepared statements properly.
    const [rows] = await pool.execute(
        'SELECT username, total_score, profile_pic FROM users ORDER BY total_score DESC LIMIT ?',
        [lim.toString()] // Pass as string or int depending on stricter modes? mysql2 takes basic types.
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
    // MySQL REPLACES behaves like Delete + Insert. ON DUPLICATE KEY UPDATE is preferred usually for preserving ID, but for settings table without AutoInc ID it's fine.
    // Actually REPLACE INTO is fine here since key is PK.
    await pool.execute('REPLACE INTO settings (\`key\`, value) VALUES (?, ?)', [key, value]);
}

async function adminUpdateUser(id, { username, email, password, role, wins, losses, total_score }) {
    if (password) {
        await pool.execute(
            "UPDATE users SET username=?, email=?, password_hash=?, role=?, wins=?, losses=?, total_score=? WHERE id=?",
            [username, email, password, role, wins, losses, total_score, id]
        );
    } else {
        await pool.execute(
            "UPDATE users SET username=?, email=?, role=?, wins=?, losses=?, total_score=? WHERE id=?",
            [username, email, role, wins, losses, total_score, id]
        );
    }
}

async function deleteUser(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
}

async function addWord(word, category, letter = null) {
    const trimmedWord = word.trim();
    const normalizedWord = normalizeArabic(trimmedWord);
    const targetLetter = letter || normalizedWord.charAt(0);
    const normalizedLetter = normalizeArabic(targetLetter);

    console.log(`[AddWord] Inserting: "${normalizedWord}" (${category}) [${normalizedLetter}]`);

    const [result] = await pool.execute(
        'INSERT IGNORE INTO dictionary (word, category, letter) VALUES (?, ?, ?)',
        [normalizedWord, category, normalizedLetter]
    );

    return { id: result.insertId };
}

async function getDictionary(category = null, letter = null, page = 1, limit = 50) {
    let baseQuery = " FROM dictionary WHERE 1=1";
    let params = [];

    console.log(`[getDictionary] Filters - Category: "${category}", Letter: "${letter}"`);

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

    // In mysql2 prepared statements, LIMIT and OFFSET must be passed as integers sometimes or appended.
    // Let's safe-append for LIMIT/OFFSET to avoid prepared statement issues with numbers as strings
    // Actually mysql2 handles ints in execute params.
    const [rows] = await pool.execute(sql, [...params, limit.toString(), offset.toString()]);

    return {
        data: rows,
        meta: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
}

async function getDictionaryStats() {
    // Count by Category
    const [categoryRows] = await pool.execute('SELECT category, COUNT(*) as count FROM dictionary GROUP BY category ORDER BY count DESC');

    // Count by Letter
    const [letterRows] = await pool.execute('SELECT letter, COUNT(*) as count FROM dictionary WHERE letter IS NOT NULL GROUP BY letter ORDER BY letter ASC');

    return {
        byCategory: categoryRows,
        byLetter: letterRows
    };
}

async function deleteWord(id) {
    await pool.execute('DELETE FROM dictionary WHERE id = ?', [id]);
}

async function logMatch(roomId, details) {
    const detailsJson = JSON.stringify(details);
    const [result] = await pool.execute(
        'INSERT INTO matches (room_id, details) VALUES (?, ?)',
        [roomId, detailsJson]
    );
    const matchId = result.insertId;

    if (details.players && Array.isArray(details.players)) {
        for (const p of details.players) {
            if (p.userId) {
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
    const [rows] = await pool.execute('SELECT * FROM matches ORDER BY played_at DESC LIMIT ?', [lim.toString()]);
    // Parse JSON details
    return rows.map(row => ({
        ...row,
        details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
    }));
}

async function getUserMatches(userId) {
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
    const query = `
        SELECT p.*, u.username as suggested_by_name 
        FROM pending_words p 
        LEFT JOIN users u ON p.suggested_by = u.id 
        ORDER BY p.created_at DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
}

async function approveWord(id) {
    const [rows] = await pool.execute('SELECT * FROM pending_words WHERE id = ?', [id]);
    const row = rows[0];
    if (!row) {
        console.log(`[ApproveWord] Suggestion ${id} not found.`);
        return;
    }

    const { word, category, letter } = row;
    console.log(`[ApproveWord] Approving: "${word}" (${category}) [${letter}]`);

    // Add to dictionary
    const result = await addWord(word, category, letter);

    if (result.id === 0) {
        console.log(`[ApproveWord] Word was IGNORED (Duplicate): "${word}" (${category})`);
    } else {
        console.log(`[ApproveWord] Word ADDED with ID ${result.id}: "${word}" (${category})`);
    }

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
    const [rows] = await pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return rows;
}

async function updateContactMessageStatus(id, status) {
    await pool.execute('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
}

async function deleteContactMessage(id) {
    await pool.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
}

async function getAdminStats() {
    const [topUsers] = await pool.execute("SELECT username, wins, total_score FROM users ORDER BY wins DESC, total_score DESC LIMIT 10");
    const [userCount] = await pool.execute("SELECT COUNT(*) as count FROM users");
    const [matchCount] = await pool.execute("SELECT COUNT(*) as count FROM matches");
    const [wordCount] = await pool.execute("SELECT COUNT(*) as count FROM dictionary");

    return {
        topUsers,
        totalUsers: userCount[0].count,
        totalGames: matchCount[0].count,
        totalWords: wordCount[0].count
    };
}

module.exports = {
    pool, // Export pool for custom queries if needed
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
    deleteUser,
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
    deleteContactMessage,
    getAdminStats,
    getDictionaryStats,
    bulkAddWords,
    approveSuggestionsBulk,
    deletePendingWordsBulk
};

async function bulkAddWords(wordsData) {
    if (!wordsData || wordsData.length === 0) return { added: 0, ignored: 0 };

    let added = 0;
    let ignored = 0;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Prepare bulk insert
        // Since we need to normalize each one, we can either do it in JS loop then one big INSERT
        // or loop inserts. For 1000s of words, one big INSERT is better but might hit packet limit.
        // Let's do batches of 500.

        const BATCH_SIZE = 500;
        for (let i = 0; i < wordsData.length; i += BATCH_SIZE) {
            const batch = wordsData.slice(i, i + BATCH_SIZE);
            const values = [];
            const placeholders = [];

            for (const item of batch) {
                const normalizedWord = normalizeArabic(item.word.trim());
                const letter = item.letter ? normalizeArabic(item.letter) : normalizedWord.charAt(0);
                values.push(normalizedWord, item.category, letter);
                placeholders.push('(?, ?, ?)');
            }

            if (values.length > 0) {
                const query = `INSERT IGNORE INTO dictionary (word, category, letter) VALUES ${placeholders.join(', ')}`;
                const [result] = await connection.execute(query, values);
                added += result.affectedRows;
                ignored += (batch.length - result.affectedRows);
            }
        }

        await connection.commit();
        return { added, ignored };
    } catch (err) {
        await connection.rollback();
        console.error("Bulk Add Error:", err);
        throw err;
    } finally {
        connection.release();
    }
}

async function approveSuggestionsBulk(ids) {
    if (!ids || ids.length === 0) return { added: 0 };

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Move to dictionary (INSERT IGNORE)
        // mysql2 allows 'IN (?)' to be expanded if passed as an array [ids]
        const [result] = await connection.query(
            'INSERT IGNORE INTO dictionary (word, category, letter, is_approved) SELECT word, category, letter, 1 FROM pending_words WHERE id IN (?)',
            [ids]
        );

        const added = result.affectedRows;

        // 2. Delete from pending_words
        await connection.query('DELETE FROM pending_words WHERE id IN (?)', [ids]);

        await connection.commit();
        return { added };
    } catch (err) {
        await connection.rollback();
        console.error("Bulk Approve Error:", err);
        throw err;
    } finally {
        connection.release();
    }
}

async function deletePendingWordsBulk(ids) {
    if (!ids || ids.length === 0) return 0;
    // Using pool.query directly expands nested arrays for IN (?)
    const [result] = await pool.query('DELETE FROM pending_words WHERE id IN (?)', [ids]);
    return result.affectedRows;
}
