const User = require("../database/models/User");
const APIErrorHandler = require("../errors/ApiErrorHandler");
const Errors = require("../errors/Errors");
const APISuccessHandler = require("../success/ApiSuccessHandler");
const Successes = require("../success/Successes");

const dateUtils = require('../utils/dateUtils');

exports.ping = async (req, res, next) => {
    try {
        const { email } = req.user;

        const user = await User.findOne({ email });
        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }

        const dateDiff = dateUtils.dateDifference(user.lastLogin);

        if (dateDiff !== 0) {
            await User.findOneAndUpdate(
                { email },
                {
                    $set: {
                        lastLogin: new Date(),
                        dailyStudyCount: 0,
                        dailyReviseCount: 0
                    },
                    $inc: { studyPoints: 1 }
                }
            );
        } else {
            console.log('User logged in again!');
        }
        APISuccessHandler(res, Successes.GENERAL_SUCCESS, {
            message: "Ping successful"
        })
    } catch (error) {
        console.error("Error in ping()", error);
        APIErrorHandler(res, Errors.SERVER_ERROR, error.message);
    }
}