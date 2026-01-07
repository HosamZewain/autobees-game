const db = require('../data/database');
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
