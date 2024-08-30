const jwt = require('jsonwebtoken');

// import User model
const User = require("../database/models/User");
const Errors = require('../errors/Errors');
const APIErrorHandler = require('../errors/ApiErrorHandler');
const APISuccessHandler = require('../success/ApiSuccessHandler');
const Successes = require('../success/Successes');

// Make a user admin
exports.makeAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }

        if (user.role === 'admin') {
            return APIErrorHandler(res, Errors.INVALID_REQUEST_ERROR, 'This user is already an admin');
        }

        const userId = user._id;

        const token = jwt.sign({ id: userId, email, isAdmin: true }, process.env.ADMIN_JWT_SECRET, { expiresIn: '7d' });

        user.role = 'admin';
        user.token = {
            value: token,
            expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        await user.save();

        return APISuccessHandler(res, Successes.USER_UPDATED_TO_ADMIN, {
            _id: userId,
            email: user.email,
            token: token,
            expiresIn: user.token.expiresIn,
        });
    } catch (error) {
        console.error('Error in adminController.makeAdmin, ', error);
        return APIErrorHandler(res, Errors.SERVER_ERROR, error.message);
    }
}