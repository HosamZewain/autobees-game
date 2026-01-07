const db = require('./src/data/database');

async function run() {
    try {
        let pool = db.pool;
        if (!pool) {
            console.log("Waiting for pool...");
            for (let i = 0; i < 20; i++) {
                if (db.pool) {
                    pool = db.pool;
                    break;
                }
                await new Promise(r => setTimeout(r, 500));
            }
        }

        if (!pool) {
            console.error("Pool never initialized!");
            process.exit(1);
        }

        const [pending] = await pool.execute('SELECT * FROM pending_words');
        console.log('--- PENDING WORDS IN DB ---');
        console.log('Total count:', pending.length);
        console.log('Items:', pending);

        process.exit(0);
    } catch (err) {
        console.error('Query Error:', err);
        process.exit(1);
    }
}

run();
