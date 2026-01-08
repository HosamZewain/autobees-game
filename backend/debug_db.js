
const { db } = require('./src/data/database_sqlite');

async function debugDictionary() {
    try {
        console.log("Checking dictionary table...");
        const count = await db.get("SELECT COUNT(*) as count FROM dictionary");
        console.log("Total words in dictionary:", count);

        const sample = await db.all("SELECT * FROM dictionary LIMIT 5");
        console.log("Sample words:", sample);

        const testCheck = await db.checkWord("أحمد", "إنسان", "أ");
        console.log("Check 'أحمد' (normalized):", testCheck);

    } catch (e) {
        console.error("Debug Error:", e);
    }
}

debugDictionary();
