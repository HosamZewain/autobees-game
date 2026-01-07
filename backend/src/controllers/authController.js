const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername, getUserByEmail } = require('../data/database');

const SECRET_KEY = 'your_super_secret_key_change_in_prod'; // In a real app, use ENV variables

async function register(req, res) {
    try {
        const { username, email, password, gender = null, profile_pic = null } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await getUserByUsername(username);
        // Note: Should also check email existence ideally, but let's trust database constraints or add a check
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
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
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username or Email already exists' });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await getUserByEmail(email);
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
        const { username, password, dob, gender, profile_pic } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Check if username is taken by another user
        const existingUser = await getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password if provided
        let passwordHash = null;
        if (password && password.trim() !== "") {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const { updateUserProfile } = require('../data/database');
        const updatedUser = await updateUserProfile(userId, username, passwordHash, dob, gender, profile_pic);

        // Return new token (since username might have changed) and user data
        const token = jwt.sign({ id: updatedUser.id, username: updatedUser.username }, SECRET_KEY, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
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

module.exports = { register, login, updateProfile, SECRET_KEY };
