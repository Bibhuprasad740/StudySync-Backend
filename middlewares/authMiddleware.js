const jwt = require('jsonwebtoken');

// import User model
const User = require('../database/models/User');
const AccountLockErrorHandler = require('../errors/AccountLockErrorHandler');
const Errors = require('../errors/Errors');

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
                if (req.path === '/logout') {
                    req.tokenExpired = true;
                    return next();
                }
            }

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
            // if the user is not logged in 
            if(dbUser.token.value === null) {
                return res.status(403).json({ message: 'You are not logged in!' });
            }

            dbUser.token.attempts++;
            await dbUser.save();

            // if enough attempts have passed, lock the user for 3 days
            return AccountLockErrorHandler(res, dbUser, 3, Errors.MIS_MATCH_TOKEN_ERROR);
        }

        req.user = user;
        req.user.isAdmin = isAdmin;

        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token' });
        }

        if (err.name === 'TokenExpiredError') {
            if (req.path === '/logout') {
                req.tokenExpired = true;
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
