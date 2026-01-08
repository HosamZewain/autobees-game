require('dotenv').config();
const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const path = require('path');

async function migrateData() {
    let mysqlConnection;

    try {
        console.log('Connecting to MySQL database...');

        // Connect to MySQL
        mysqlConnection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3307,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'autobees',
            connectTimeout: 10000
        });

        console.log('✅ Connected to MySQL');

        // Open SQLite database
        const sqliteDb = new Database(path.join(__dirname, 'src', 'autobees.sqlite'));
        console.log('✅ Opened SQLite database');

        // Migrate Users
        console.log('\n📦 Migrating users...');
        const [users] = await mysqlConnection.execute('SELECT * FROM users');
        console.log(`Found ${users.length} users`);

        const insertUser = sqliteDb.prepare(`
            INSERT OR REPLACE INTO users 
            (id, username, email, password_hash, wins, losses, total_score, role, is_active, dob, gender, profile_pic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const user of users) {
            insertUser.run(
                user.id, user.username, user.email, user.password_hash,
                user.wins || 0, user.losses || 0, user.total_score || 0,
                user.role || 'user', user.is_active !== undefined ? user.is_active : 1,
                user.dob, user.gender, user.profile_pic
            );
        }
        console.log(`✅ Migrated ${users.length} users`);

        // Migrate Settings
        console.log('\n📦 Migrating settings...');
        const [settings] = await mysqlConnection.execute('SELECT * FROM settings');
        console.log(`Found ${settings.length} settings`);

        const insertSetting = sqliteDb.prepare('INSERT OR REPLACE INTO settings (`key`, value) VALUES (?, ?)');
        for (const setting of settings) {
            insertSetting.run(setting.key, setting.value);
        }
        console.log(`✅ Migrated ${settings.length} settings`);

        // Migrate Dictionary
        console.log('\n📦 Migrating dictionary...');
        const [dictWords] = await mysqlConnection.execute('SELECT * FROM dictionary');
        console.log(`Found ${dictWords.length} dictionary words`);

        const insertWord = sqliteDb.prepare(`
            INSERT OR IGNORE INTO dictionary (id, word, category, letter, is_approved)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const word of dictWords) {
            insertWord.run(
                word.id, word.word, word.category, word.letter,
                word.is_approved !== undefined ? word.is_approved : 1
            );
        }
        console.log(`✅ Migrated ${dictWords.length} dictionary words`);

        // Migrate Matches
        console.log('\n📦 Migrating matches...');
        const [matches] = await mysqlConnection.execute('SELECT * FROM matches');
        console.log(`Found ${matches.length} matches`);

        const insertMatch = sqliteDb.prepare(`
            INSERT OR IGNORE INTO matches (id, room_id, played_at, details)
            VALUES (?, ?, ?, ?)
        `);

        for (const match of matches) {
            // Convert MySQL datetime to ISO string for SQLite
            const playedAt = match.played_at instanceof Date
                ? match.played_at.toISOString()
                : (match.played_at ? String(match.played_at) : null);

            insertMatch.run(
                match.id,
                match.room_id,
                playedAt,
                typeof match.details === 'string' ? match.details : JSON.stringify(match.details)
            );
        }
        console.log(`✅ Migrated ${matches.length} matches`);

        // Migrate Match Participants
        console.log('\n📦 Migrating match participants...');
        const [participants] = await mysqlConnection.execute('SELECT * FROM match_participants');
        console.log(`Found ${participants.length} match participants`);

        const insertParticipant = sqliteDb.prepare(`
            INSERT OR IGNORE INTO match_participants (id, match_id, user_id, score, is_winner)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const p of participants) {
            insertParticipant.run(p.id, p.match_id, p.user_id, p.score || 0, p.is_winner || 0);
        }
        console.log(`✅ Migrated ${participants.length} match participants`);

        // Migrate Pending Words
        console.log('\n📦 Migrating pending words...');
        const [pendingWords] = await mysqlConnection.execute('SELECT * FROM pending_words');
        console.log(`Found ${pendingWords.length} pending words`);

        const insertPending = sqliteDb.prepare(`
            INSERT OR IGNORE INTO pending_words (id, word, category, letter, suggested_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const pw of pendingWords) {
            const createdAt = pw.created_at instanceof Date
                ? pw.created_at.toISOString()
                : (pw.created_at ? String(pw.created_at) : null);

            insertPending.run(pw.id, pw.word, pw.category, pw.letter, pw.suggested_by, createdAt);
        }
        console.log(`✅ Migrated ${pendingWords.length} pending words`);

        // Migrate Contact Messages
        console.log('\n📦 Migrating contact messages...');
        const [contacts] = await mysqlConnection.execute('SELECT * FROM contact_messages');
        console.log(`Found ${contacts.length} contact messages`);

        const insertContact = sqliteDb.prepare(`
            INSERT OR IGNORE INTO contact_messages (id, name, contact_info, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const c of contacts) {
            const createdAt = c.created_at instanceof Date
                ? c.created_at.toISOString()
                : (c.created_at ? String(c.created_at) : null);

            insertContact.run(c.id, c.name, c.contact_info, c.message, c.status || 'new', createdAt);
        }
        console.log(`✅ Migrated ${contacts.length} contact messages`);

        sqliteDb.close();
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Settings: ${settings.length}`);
        console.log(`   - Dictionary: ${dictWords.length}`);
        console.log(`   - Matches: ${matches.length}`);
        console.log(`   - Match Participants: ${participants.length}`);
        console.log(`   - Pending Words: ${pendingWords.length}`);
        console.log(`   - Contact Messages: ${contacts.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\nDetails:', error);
        process.exit(1);
    } finally {
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('\nMySQL connection closed');
        }
    }
}

migrateData();
