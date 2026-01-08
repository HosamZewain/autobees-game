const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername, getUserByEmail } = require('../data/database_sqlite');

const SECRET_KEY = 'your_super_secret_key_change_in_prod'; // In a real app, use ENV variables

async function register(req, res) {
    try {
        const { username, email, password, gender = null, profile_pic = null } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const existingEmail = await getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Default role is 'user'
        const newUser = await createUser(username, email, hashedPassword, gender, profile_pic, 'user');

        const token = jwt.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                wins: 0,
                losses: 0,
                total_score: 0,
                gender: newUser.gender,
                profile_pic: newUser.profile_pic
            }
        });
    } catch (error) {
        // Handle SQLite Unique Constraint Error
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or Email already exists' });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
}

async function login(req, res) {
    try {
        const { email, username, password } = req.body;
        const loginIdentifier = email || username;

        if (!loginIdentifier || !password) {
            return res.status(400).json({ error: 'Email/Username and password required' });
        }

        let user;
        if (email) {
            user = await getUserByEmail(email);
        } else {
            user = await getUserByUsername(username);
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.is_active === 0) {
            return res.status(403).json({ error: 'Account is banned' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user', // Default for legacy users
                wins: user.wins,
                losses: user.losses,
                total_score: user.total_score,
                gender: user.gender,
                profile_pic: user.profile_pic
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.id; // From middleware
        const { username, email, password, dob, gender, profile_pic } = req.body;

        if (!username || !email) {
            return res.status(400).json({ error: 'Username and Email are required' });
        }

        // Check availability
        const { getUserByUsername, getUserByEmail, updateUserProfile } = require('../data/database_sqlite');

        // Check username
        const existingUser = await getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Check email
        const existingEmail = await getUserByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password if provided
        let passwordHash = null;
        if (password && password.trim() !== "") {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await updateUserProfile(userId, username, email, passwordHash, dob, gender, profile_pic);

        // Return new token (since username might have changed) and user data
        const token = jwt.sign({ id: updatedUser.id, username: updatedUser.username }, SECRET_KEY, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                wins: updatedUser.wins,
                losses: updatedUser.losses,
                total_score: updatedUser.total_score,
                dob: updatedUser.dob,
                gender: updatedUser.gender,
                profile_pic: updatedUser.profile_pic
            }
        });

    } catch (error) {
        console.error('Update Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getPublicProfile(req, res) {
    try {
        const idOrUsername = req.params.id;
        const { getUserById, getUserByUsername } = require('../data/database_sqlite');

        let user;
        // Check if input is purely numeric (ID) or string (Username)
        // Note: Usernames in this app can contain numbers, but usually IDs are pure numbers.
        // Safer approach: Try username first, if not found and is numeric, try ID.
        // OR: changing route to /profile/:username is cleaner but route param is :id.

        user = await getUserByUsername(idOrUsername);

        if (!user && !isNaN(idOrUsername)) {
            user = await getUserById(idOrUsername);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            wins: user.wins,
            losses: user.losses,
            total_score: user.total_score,
            gender: user.gender,
            profile_pic: user.profile_pic,
            joined_at: user.created_at // Assuming created_at exists, checks needed
        });
    } catch (error) {
        console.error('Get Public Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { register, login, updateProfile, getPublicProfile, SECRET_KEY };
