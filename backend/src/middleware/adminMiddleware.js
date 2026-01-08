const { getUserById } = require('../data/database_sqlite');

async function adminMiddleware(req, res, next) {
    try {
        const user = req.user; // Set by authMiddleware
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch full user details (including role) from DB
        const dbUser = await getUserById(user.id);

        if (!dbUser || dbUser.role !== 'admin') {
            return res.status(403).json({ error: 'Forsbiden: Admins only' });
        }

        req.user = dbUser; // Update req.user with full details
        next();
    } catch (err) {
        console.error('Admin middleware error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = adminMiddleware;
