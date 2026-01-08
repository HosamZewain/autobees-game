const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'autobees.sqlite');
const db = new Database(dbPath);

async function resetPassword() {
    const newPassword = 'admin123';
    const username = 'admin';

    try {
        console.log(`Hashing new password for ${username}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`Updating database...`);
        const result = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hashedPassword, username);

        if (result.changes > 0) {
            console.log(`✅ Password for "${username}" has been reset to: ${newPassword}`);
        } else {
            console.log(`❌ User "${username}" not found in database.`);

            // Try to create the admin user
            try {
                console.log(`Creating new admin user "${username}"...`);
                db.prepare('INSERT INTO users (username, email, password_hash, role, wins, losses, total_score) VALUES (?, ?, ?, ?, 0, 0, 0)').run(username, 'admin@autobees.site', hashedPassword, 'admin');
                console.log(`✅ Created new admin user: "${username}" with password: ${newPassword}`);
            } catch (insertError) {
                console.error("Failed to create admin user:", insertError);
            }
        }
    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        db.close();
    }
}

resetPassword();
