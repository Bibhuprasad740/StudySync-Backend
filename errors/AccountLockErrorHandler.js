const Errors = require("./Errors");

const AccountLockErrorHandler = async (res, user, days, error) => {
    const { message, status } = error;

    // TODO: save this data for future analysis
    switch (error) {
        case Errors.MIS_MATCH_TOKEN_ERROR: {
            if (user.token.attempts > 5) {
                user.isLocked = true;
                user.lockUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                await user.save();

                return res.status(status).json({
                    message: 'Account locked for 3 days due to multiple failed attempts.'
                });
            }

            return res.status(403).json({
                message: 'Invalid token! Your account may get locked!',
                attemptsLeft: 6 - user.token.attempts,
            });
        }
        case Errors.PURCHASE_FORGERY_ERROR: {
            user.isLocked = true;
            user.lockUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            await user.save();

            return res.status(status).json({ message });
        }

        default: return res.status(status).json({ message });
    }
}

module.exports = AccountLockErrorHandler;