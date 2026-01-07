const db = require('./src/data/database');

async function run() {
    try {
        // Since database.js calls it at top-level, we might just need to wait or call it again
        // Safer to just use the pool if it's there
        let pool = db.pool;
        if (!pool) {
            console.log("Pool not ready, waiting...");
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

        const [dict] = await pool.execute('SELECT COUNT(*) as count FROM dictionary');
        const [pending] = await pool.execute('SELECT COUNT(*) as count FROM pending_words');
        const [hWords] = await pool.execute('SELECT word, category FROM dictionary WHERE letter = ? LIMIT 5', ['ح']);
        const [hPending] = await pool.execute('SELECT word, category FROM pending_words WHERE letter = ? LIMIT 5', ['ح']);

        console.log('--- DB STATS ---');
        console.log('Dictionary count:', dict[0].count);
        console.log('Pending count:', pending[0].count);
        console.log('Dictionary ح words:', hWords);
        console.log('Pending ح words:', hPending);

        process.exit(0);
    } catch (err) {
        console.error('Query Error:', err);
        process.exit(1);
    }
}

run();
