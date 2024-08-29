const User = require('../database/models/User');

const accountLockMiddleware = async (req, res, next) => {
    const email = req.user.email;
    const user = await User.findOne({ email });
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
    next();
}

module.exports = accountLockMiddleware;