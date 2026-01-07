const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'autobees'
        });

        const [rows] = await connection.execute('SELECT * FROM pending_words');
        console.log('--- PENDING WORDS ---');
        console.log('Count:', rows.length);
        console.log('Rows:', JSON.stringify(rows, null, 2));

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
}

run();
