const jwt = require('jsonwebtoken');

// import User model
const User = require('../database/models/User');

const authMiddleware = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
        let user;
        let isAdmin = false;

        // Try verifying as an admin token first
        try {
            user = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
            isAdmin = true;
        } catch (adminErr) {
            if (adminErr.name !== 'JsonWebTokenError') {
                throw adminErr;
            }

            // Token expired but on logout route, allow it to proceed
            if (adminErr.name === 'TokenExpiredError') {
                if(req.path === '/logout'){
                    return next();
                }
            }

            console.log('about to verify token for normal user..')
            // Verify as a normal user token if not an admin token
            user = jwt.verify(token, process.env.JWT_SECRET);
        }

        // Fetch the user from the database
        const dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
            return res.status(403).json({ message: 'User not found' });
        }

        // Check if token matches the token in the user's token store
        if (dbUser.token.value !== token) {
            dbUser.token.attempts++;
            if (dbUser.token.attempts > 5) {
                // TODO: save this data for future analysis
                dbUser.isLocked = true;
                dbUser.lockUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                await dbUser.save();
                return res.status(403).json({ message: 'Account locked due to multiple failed attempts.' });
            }
            await dbUser.save();
            return res.status(403).json({ message: 'Invalid token' });
        }

        dbUser.token.attempts = 0;
        await dbUser.save();

        req.user = user;
        req.user.isAdmin = isAdmin;
        
        next();
    } catch (err) {
        if(err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token' });
        }

        if (err.name === 'TokenExpiredError') {
            if (req.path === '/logout') {
                return next();
            } else {
                return res.status(403).json({ message: 'Token expired' });
            }
        }

        console.log('Error in authMiddleware:', err.message);
        return res.status(403).json({ message: 'Authentication failed' });
    }
};

module.exports = authMiddleware;
