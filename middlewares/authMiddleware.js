const authMiddleware = (req, res, next) => {
    if(!req.headers['x-api-key']) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const apiKey = req.headers['x-api-key'];
    if(apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: 'Invalid API key' });
    }

    next();
}

module.exports = authMiddleware;