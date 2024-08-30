const User = require("../database/models/User");
const APIErrorHandler = require("../errors/ApiErrorHandler");
const Errors = require("../errors/Errors");

const dateUtils = require('../utils/dateUtils');

exports.ping = async (req, res, next) => {
    try {
        const { email } = req.user;

        const user = await User.findOne({ email });
        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }
        
        const dateDiff = dateUtils.dateDifference(user.lastLogin);

        if(dateDiff !== 0) {
            user.lastLogin = new Date();
            user.studyPoints += 1;
            await user.save();
        }
        res.status(200).json({ message: "Ping successful" });
    } catch (error) {
        console.error("Error in ping()", error);
        APIErrorHandler(res, Errors.SERVER_ERROR, error.message);
    }
}