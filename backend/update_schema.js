const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    console.log('Updating Database Schema...');

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'autobees_db',
        port: process.env.DB_PORT || 3306
    };

    console.log('Connecting to:', dbConfig.database);

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Add or Modify profile_pic to LONGTEXT (to support 5MB images)
        try {
            // First try to add, if fails, try to modify
            try {
                await connection.query("ALTER TABLE users ADD COLUMN profile_pic LONGTEXT");
                console.log('Added profile_pic column (LONGTEXT).');
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log('profile_pic exists, changing to LONGTEXT...');
                    await connection.query("ALTER TABLE users MODIFY COLUMN profile_pic LONGTEXT");
                    console.log('Updated profile_pic to LONGTEXT.');
                }
                else throw e;
            }
        } catch (e) {
            console.error('Error handling profile_pic:', e.message);
        }

        // Add gender
        try {
            await connection.query("ALTER TABLE users ADD COLUMN gender VARCHAR(50)");
            console.log('Added gender column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('gender already exists.');
            else console.error('Error adding gender:', e.message);
        }

        // Add dob
        try {
            await connection.query("ALTER TABLE users ADD COLUMN dob VARCHAR(50)");
            console.log('Added dob column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('dob already exists.');
            else console.error('Error adding dob:', e.message);
        }

        console.log('Schema Update Completed!');

    } catch (err) {
        console.error('Connection Failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
