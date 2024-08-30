
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../database/models/User');

const dateUtils = require('../utils/dateUtils');
const APIErrorHandler = require('../errors/ApiErrorHandler');
const Errors = require('../errors/Errors');
const APISuccessHandler = require('../success/ApiSuccessHandler');
const Successes = require('../success/Successes');

// controller method for signin
exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }

        // Blocked user due to invalid purchase token forgery
        if (user.isLocked) {
            const lockUntil = new Date(user.lockUntil);
            const today = new Date();

            // if lockUntil date is in future, return immediately
            if (today <= lockUntil) {
                const unlockDate = dateUtils.formatDate(lockUntil);
                return APIErrorHandler(res, Errors.ACCOUNT_LOCKED_ERROR, `Your account is locked until ${unlockDate}`);
            }

            // unlock the account
            user.isLocked = false;
            user.lockUntil = null;
            await user.save();
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return APIErrorHandler(res, Errors.INCORRECT_PASSWORD_ERROR);
        }

        // TODO: Create method in date utils for expiration date calculation
        let token;
        if (user.role === 'admin') {
            token = jwt.sign({ id: user._id, email: email, isAdmin: true }, process.env.ADMIN_JWT_SECRET, { expiresIn: '7d' });
        } else {
            token = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        }

        user.token = {
            value: token,
            expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        user.lastLogin = new Date(Date.now());

        await user.save();
        return APISuccessHandler(res, Successes.GENERAL_SUCCESS, {
            _id: user._id,
            email: user.email,
            token: token,
            expiresIn: user.token.expiresIn,
        });
    } catch (err) {
        console.error('Error signing in:', err);
        return APIErrorHandler(res, Errors.SIGN_IN_ERROR, err.message);
    }
};

// controller method for signup
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return APIErrorHandler(res, Errors.SIGN_UP_ERROR, 'Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const jwtToken = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // token and expires in 7 days
        const token = {
            value: jwtToken,
            expiresIn: new Date(Date.now() + 7 * 60 * 60 * 1000),
        }

        user.token = token;
        await user.save();

        APISuccessHandler(res, Successes.GENERAL_SUCCESS, {
            _id: user._id,
            email: user.email,
            token: token.value,
            expiresIn: token.expiresIn,
        });
    } catch (err) {
        console.error('Error checking for existing user:', err);
        return APIErrorHandler(res, Errors.SERVER_ERROR, err.message);
    }
}

// controller method for logout
exports.logout = async (req, res) => {

    let userId;
    if (req.tokenExpired) {
        userId = req.body.userId;
        if (!userId) {
            return APIErrorHandler(res, Errors.TOKEN_EXPIRED_ERROR, 'UserId is required!s');
        }
    } else {
        userId = req.user.id;
    }
    try {
        const user = await User.findByIdAndUpdate(userId, {
            $set: {
                token: {
                    value: null,
                    expiresIn: null,
                    attempts: 0,
                }
            }
        });

        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }

        APISuccessHandler(res, Successes.LOG_OUT_SUCCESS);
    } catch (err) {
        console.error('Error logging out:', err);
        return APIErrorHandler(res, Errors.SERVER_ERROR, err.message);
    }
}