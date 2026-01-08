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

            // Check if any admin exists
            const anyAdmin = db.prepare("SELECT username FROM users WHERE role = 'admin' LIMIT 1").get();
            if (anyAdmin) {
                console.log(`Found another admin: "${anyAdmin.username}". Updating that instead...`);
                db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hashedPassword, anyAdmin.username);
                console.log(`✅ Password for "${anyAdmin.username}" has been reset to: ${newPassword}`);
            }
        }
    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        db.close();
    }
}

resetPassword();
