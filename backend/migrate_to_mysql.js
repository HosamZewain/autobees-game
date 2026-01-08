const sqlite3 = require('better-sqlite3');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

// SQLite Connection
const sqlitePath = path.join(__dirname, 'src', 'autobees.sqlite');
const sqlite = new sqlite3(sqlitePath);

// MySQL Connection
async function migrate() {
    console.log('Starting migration from SQLite to MySQL...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'autobees_db',
        waitForConnections: true,
        connectionLimit: 1,
        multipleStatements: true
    });

    const connection = await pool.getConnection();

    try {
        // Disable foreign key checks for bulk insert
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Creating Tables...');
        const createTablesSQL = [
            `CREATE TABLE IF NOT EXISTS users (
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
            )`,
            `CREATE TABLE IF NOT EXISTS settings (
                \`key\` VARCHAR(100) PRIMARY KEY,
                value TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS dictionary (
                id INT AUTO_INCREMENT PRIMARY KEY,
                word VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                letter VARCHAR(10),
                is_approved TINYINT DEFAULT 1,
                UNIQUE KEY unique_word_cat (word, category)
            )`,
            `CREATE TABLE IF NOT EXISTS matches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id VARCHAR(100),
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                details JSON
            )`,
            `CREATE TABLE IF NOT EXISTS pending_words (
                id INT AUTO_INCREMENT PRIMARY KEY,
                word VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                letter VARCHAR(10) NOT NULL,
                suggested_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (suggested_by) REFERENCES users(id) ON DELETE SET NULL,
                UNIQUE KEY unique_pending (word, category)
            )`,
            `CREATE TABLE IF NOT EXISTS match_participants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id INT NOT NULL,
                user_id INT NOT NULL,
                score INT DEFAULT 0,
                is_winner TINYINT DEFAULT 0,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact_info VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const sql of createTablesSQL) {
            await connection.query(sql);
        }


        // 1. Migrate Users
        console.log('Migrating Users...');
        const users = sqlite.prepare('SELECT * FROM users').all();
        if (users.length > 0) {
            // Check if users table is empty in MySQL before migrating to avoid duplicates if re-run
            // Or just use REPLACE INTO / INSERT IGNORE
            // We want to preserve IDs, so INSERT IGNORE is good.
            for (const u of users) {
                // Determine missing fields defaults
                const role = u.role || 'user';
                const isActive = u.is_active !== undefined ? u.is_active : 1;
                // handle dates if needed, improved handling

                await connection.execute(`
                    INSERT IGNORE INTO users (id, username, email, password_hash, wins, losses, total_score, role, is_active, dob, gender, profile_pic)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [u.id, u.username, u.email, u.password_hash, u.wins, u.losses, u.total_score, role, isActive, u.dob, u.gender, u.profile_pic]);
            }
        }
        console.log(`Migrated ${users.length} users.`);

        // 2. Migrate Dictionary
        console.log('Migrating Dictionary...');
        const words = sqlite.prepare('SELECT * FROM dictionary').all();
        if (words.length > 0) {
            const batchSize = 100;
            // Batch insert for speed
            for (let i = 0; i < words.length; i += batchSize) {
                const batch = words.slice(i, i + batchSize);
                const values = [];
                const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(',');
                batch.forEach(w => {
                    values.push(w.id, w.word, w.category, w.letter, w.is_approved);
                });

                if (values.length > 0) {
                    await connection.execute(`INSERT IGNORE INTO dictionary (id, word, category, letter, is_approved) VALUES ${placeholders}`, values);
                }
            }
        }
        console.log(`Migrated ${words.length} words.`);

        // 3. Migrate Settings
        console.log('Migrating Settings...');
        const settings = sqlite.prepare('SELECT * FROM settings').all();
        for (const s of settings) {
            await connection.execute('INSERT IGNORE INTO settings (\`key\`, value) VALUES (?, ?)', [s.key, s.value]);
        }

        // 4. Migrate Matches
        console.log('Migrating Matches...');
        const matches = sqlite.prepare('SELECT * FROM matches').all();
        for (const m of matches) {
            await connection.execute('INSERT IGNORE INTO matches (id, room_id, played_at, details) VALUES (?, ?, ?, ?)', [m.id, m.room_id, m.played_at, m.details]);
        }
        console.log(`Migrated ${matches.length} matches.`);

        // 5. Migrate Match Participants
        console.log('Migrating Match Participants...');
        const participants = sqlite.prepare('SELECT * FROM match_participants').all();
        if (participants.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < participants.length; i += batchSize) {
                const batch = participants.slice(i, i + batchSize);
                const values = [];
                const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(',');
                batch.forEach(p => {
                    values.push(p.id, p.match_id, p.user_id, p.score, p.is_winner);
                });

                if (values.length > 0) {
                    await connection.execute(`INSERT IGNORE INTO match_participants (id, match_id, user_id, score, is_winner) VALUES ${placeholders}`, values);
                }
            }
        }

        // 6. Migrate Pending Words
        console.log('Migrating Pending Words...');
        const pending = sqlite.prepare('SELECT * FROM pending_words').all();
        for (const p of pending) {
            await connection.execute('INSERT IGNORE INTO pending_words (id, word, category, letter, suggested_by, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [p.id, p.word, p.category, p.letter, p.suggested_by, p.created_at]);
        }

        // 7. Migrate Contact Messages
        console.log('Migrating Contact Messages...');
        const messages = sqlite.prepare('SELECT * FROM contact_messages').all();
        for (const msg of messages) {
            await connection.execute('INSERT IGNORE INTO contact_messages (id, name, contact_info, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [msg.id, msg.name, msg.contact_info, msg.message, msg.status, msg.created_at]);
        }

        console.log('Migration Completed Successfully!');

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        connection.release();
        process.exit();
    }
}

migrate();
