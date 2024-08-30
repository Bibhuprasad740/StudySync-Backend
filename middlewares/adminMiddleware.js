const Errors = require('../errors/Errors');
const AdminErrorHandler = require('../errors/AdminErrorHandler');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        if(!req.headers['x-api-key']){
            return AdminErrorHandler(res, Errors.INVALID_ADMIN );
        }

        const apiKey = req.headers['x-api-key'];
        if(!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
            return AdminErrorHandler(res, Errors.INVALID_ADMIN );
        }

        // User is authenticated and is an admin with a valid API key
        next();
    } else {
        return AdminErrorHandler(res, Errors.ACCESS_DENIED);
    }
};

module.exports = adminMiddleware;
