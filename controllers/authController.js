
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../database/models/User');

const dateUtils = require('../utils/dateUtils');

// controller method for signin
exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Blocked user due to invalid purchase token forgery
        if (user.isLocked) {
            const lockUntil = new Date(user.lockUntil);
            const today = new Date();

            // if lockUntil date is in future, return immediately
            if (today <= lockUntil) {
                const unlockDate = dateUtils.formatDate(lockUntil);
                return res.status(403).json({ message: `Account is locked till ${unlockDate}!` });
            }

            // unlock the account
            user.isLocked = false;
            user.lockUntil = null;
            await user.save();
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        let token;
        if (user.role === 'admin') {
            token = jwt.sign({ id: user._id, email: email, isAdmin: true }, process.env.ADMIN_JWT_SECRET, { expiresIn: '7d' });
        } else {
            token = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET, { expiresIn: '2h' });
        }

        user.token = {
            value: token,
            expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000),
        };

        user.lastLogin = new Date(Date.now());

        await user.save();

        res.json({
            _id: user._id,
            email: user.email,
            token: token,
        });
    } catch (err) {
        console.error('Error signing in:', err);
        return res.status(500).json({ message: err.message });
    }
};

// controller method for signup
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const jwtToken = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '2h' });

        // token and expires in 2 hours
        const token = {
            value: jwtToken,
            expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000),
        }

        const user = new User({ name, email, password: hashedPassword, token });
        await user.save();

        res.json({
            _id: user._id,
            email: user.email,
            token: token,
        });
    } catch (err) {
        console.error('Error checking for existing user:', err);
        return res.status(500).json({ message: err.message });
    }
}

// controller method for logout
exports.logout = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, {
            $set: {
                token: {
                    value: null,
                    expiresIn: null,
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Error logging out:', err);
        return res.status(500).json({ message: err.message });
    }
}

// TODO: make a user admin