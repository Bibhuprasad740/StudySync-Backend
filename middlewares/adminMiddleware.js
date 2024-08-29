const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // User is authenticated and is an admin
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = adminMiddleware;
