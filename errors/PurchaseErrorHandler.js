const Errors = require("./Errors");

const PurchaseErrorHandler = (res, error, user, errorMessage) => {
    const { message, status } = error;

    switch (error) {
        case Errors.PURCHASE_HISTORY_NOT_FOUND_ERROR: {
            // TODO: warn user of being locked
            return res.status(status).json({ message: message + errorMessage ? ' ' + errorMessage : '' });
        }

        default: return res.status(status).json({ message: message + errorMessage ? ' ' + errorMessage : '' });
    }
}

module.exports = PurchaseErrorHandler;