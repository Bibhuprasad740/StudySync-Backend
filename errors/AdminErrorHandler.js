const Errors = require('./Errors');

const AdminErrorHandler = async (res, error ) => {
    const { message, status } = error;

    switch (error) {
        case Errors.INVALID_ADMIN: {
            // TODO: warn user of being locked
            return res.status(status).json({ message });
        }

        default: return res.status(status).json({ message });
    }
}

module.exports = AdminErrorHandler;