const Successes = require("./Successes");

const APISuccessHandler = (res, success, data = null, successMessage = null) => {
    const { message, status } = success;
    if (successMessage) {
        console.log(successMessage);
    }
    console.log(message, status);

    switch (success) {
        // to be added
        case Successes.GENERAL_SUCCESS:
        case Successes.USER_UPDATED_TO_ADMIN: {
            return res.status(200).json(data);
        }

        default: return res.status(status).json({ message: message + (successMessage ? ' ' + successMessage : '') });
    }
}

module.exports = APISuccessHandler;