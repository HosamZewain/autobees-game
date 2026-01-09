const db = require('../data/database_mysql');
const bcrypt = require('bcryptjs');

// --- Users ---
exports.getUsers = async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        await db.updateUserStatus(id, is_active);
        res.json({ message: 'User status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

        const existing = await db.getUserByUsername(username);
        if (existing) return res.status(400).json({ error: 'Username taken' });

        const existingEmail = await db.getUserByEmail(email);
        if (existingEmail) return res.status(400).json({ error: 'Email taken' });

        const hashedPassword = await bcrypt.hash(password, 10);
        // Signature: username, email, passwordHash, gender, profilePic, role
        await db.createUser(username, email, hashedPassword, null, 'bee_1.png', role || 'user');
        res.json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role, wins, losses, total_score } = req.body;

        let hashedPassword = null;
        if (password && password.trim().length > 0) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await db.adminUpdateUser(id, {
            username,
            email,
            password: hashedPassword,
            role,
            wins,
            losses,
            total_score
        });
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteUser(id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Settings ---
exports.getSettings = async (req, res) => {
    try {
        const settings = await db.getSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body; // { key: value, ... }
        for (const [key, value] of Object.entries(settings)) {
            await db.updateSetting(key, value);
        }
        res.json({ message: 'Settings updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Dictionary ---
exports.getDictionary = async (req, res) => {
    try {
        const { category, letter, page = 1, limit = 50 } = req.query;
        const result = await db.getDictionary(category, letter, page, limit);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDictionaryStats = async (req, res) => {
    try {
        const stats = await db.getDictionaryStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addWord = async (req, res) => {
    try {
        const { word, category, letter } = req.body;
        await db.addWord(word, category, letter);
        res.json({ message: 'Word added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteWord = async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteWord(id);
        res.json({ message: 'Word deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.importWords = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Require xlsx here or at top. It was required inside try block in previous version.
        const xlsx = require('xlsx');
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!rows || rows.length === 0) {
            return res.status(400).json({ error: 'Empty file' });
        }

        const validWords = [];
        for (const row of rows) {
            // Check for various column names (Arabic or English)
            const word = row['word'] || row['Word'] || row['الكلمة'] || row['كلمة'];
            const category = row['category'] || row['Category'] || row['التصنيف'] || row['تصنيف'] || 'ولد';
            const letter = row['letter'] || row['Letter'] || row['الحرف'] || row['حرف'];

            if (word) {
                validWords.push({ word: String(word), category: String(category), letter: letter ? String(letter) : null });
            }
        }

        const result = await db.bulkAddWords(validWords);
        res.json(result);
    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
};

exports.exportWords = async (req, res) => {
    try {
        const words = await db.getAllDictionaryWords();
        const xlsx = require('xlsx');

        const worksheet = xlsx.utils.json_to_sheet(words);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Dictionary");

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="dictionary_export.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('Export Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- History ---
exports.getMatchHistory = async (req, res) => {
    try {
        const matches = await db.getMatches(100); // Limit 100 recent games
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Suggestions ---
exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = await db.getPendingWords();
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approveSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        await db.approveWord(id);
        res.json({ message: 'Word approved and added to dictionary' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        await db.deletePendingWord(id);
        res.json({ message: 'Suggestion deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Seed Admin (For dev convenience) ---
exports.createFirstAdmin = async (req, res) => {
    try {
        const users = await db.getAllUsers();
        const hasAdmin = users.some(u => u.role === 'admin');

        if (hasAdmin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.createUser(username, hashedPassword, 'admin');

        res.json({ message: 'Admin created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bulkApproveSuggestions = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });

        const result = await db.approveSuggestionsBulk(ids);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Bulk Approve Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.bulkRejectSuggestions = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });

        const count = await db.deletePendingWordsBulk(ids);
        res.json({ success: true, deleted: count });
    } catch (err) {
        console.error('Bulk Reject Error:', err);
        res.status(500).json({ error: err.message });
    }
};
