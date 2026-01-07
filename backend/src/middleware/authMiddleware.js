const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../controllers/authController');
const { getUserById } = require('../data/database');

async function socketAuthMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await getUserById(decoded.id);

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.user = {
            id: user.id.toString(),
            username: user.username,
            wins: user.wins,
            losses: user.losses,
            total_score: user.total_score
        };

        next();
    } catch (error) {
        console.error('Socket Auth Error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
}

async function expressAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return res.status(401).json({ error: 'Token missing' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        // We set req.user temporarily with ID, adminMiddleware will fetch full details if needed
        req.user = { id: decoded.id, username: decoded.username };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = { socketAuthMiddleware, expressAuthMiddleware };
