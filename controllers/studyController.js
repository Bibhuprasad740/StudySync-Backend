const jwt = require('jsonwebtoken');

// User model
const User = require('../database/models/User');

const dateUtils = require('../utils/dateUtils');
const AccountLockHandler = require('../errors/AccountLockErrorHandler');
const Errors = require('../errors/Errors');
const APIErrorHandler = require('../errors/ApiErrorHandler');
const PurchaseErrorHandler = require('../errors/PurchaseErrorHandler');
const APISuccessHandler = require('../success/ApiSuccessHandler');
const Successes = require('../success/Successes');

// Get all study data for a user
exports.getAllStudyData = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await User.findOne({ email });

        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }

        APISuccessHandler(res, Successes.GENERAL_SUCCESS, user.studies);
    } catch (error) {
        console.error('Error in getAllStudyData()', error);
        return APIErrorHandler(res, Errors.SERVER_ERROR, error.message);
    }
}

// Add new study data
exports.addStudyData = async (req, res) => {
    try {
        // Await the user fetch operation
        const user = await User.findOne({ email: req.user.email });

        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }

        const { topic, subject, additionalInfo, date } = req.body;

        if (!topic || !subject) {
            return APIErrorHandler(res, Errors.INVALID_REQUEST_ERROR, 'Topic and subject are required');
        }

        // Check if user has exceeded the daily limit
        // TODO: Add security check for admin => admin token
        if (user.role !== 'admin' && user.purchaseData.currentPlan === 'inactive') {
            if (user.dailyStudyCount >= process.env.FREE_DAILY_STUDY_COUNT) {
                return APIErrorHandler(res, Errors.LIMIT_REACHED_ERROR);
            }
        } else if (user.role !== 'admin' && user.purchaseData.currentPlan === 'active') {
            const purchaseHistory = user.purchaseData.purchaseHistory;
            if (!purchaseHistory || purchaseHistory.length === 0) {
                return PurchaseErrorHandler(res, Errors.PURCHASE_HISTORY_NOT_FOUND_ERROR, 'Please contact support!')
            }

            const lastPurchase = purchaseHistory[purchaseHistory.length - 1];
            try {
                const data = jwt.verify(lastPurchase, process.env.PURCHASE_SECRET);
                const dailyStudyLimit = data.dailyStudyLimit;
                if (user.dailyStudyCount >= dailyStudyLimit) {
                    return APIErrorHandler(res, Errors.LIMIT_REACHED_ERROR);
                }
            } catch (error) {
                // lock the account for next 3 months for purchase forgery
                return AccountLockHandler(res, user, 90, Errors.PURCHASE_FORGERY_ERROR);
            }
        }
        const newStudyData = {
            topic,
            subject,
            additionalInfo,
            revisionCount: 0,
        };

        // Studied on a particular date
        if (date) {
            if (!dateUtils.isValidDate(date)) {
                return APIErrorHandler(res, Errors.INVALID_REQUEST_ERROR, 'Invalid date format');
            }

            // check if the study date is in future
            if (new Date(date) > new Date()) {
                return APIErrorHandler(res, Errors.INVALID_REQUEST_ERROR, 'Study date cannot be in future!');
            }

            newStudyData.date = new Date(date);
        }

        // Push newStudyData into studies array in user object
        user.studies.push(newStudyData);

        // Update daily study count
        user.dailyStudyCount++;
        await user.save();

        res.status(201).json({
            message: 'Study data added successfully'
        });
    } catch (error) {
        console.error('Error adding study data:', error);
        return APIErrorHandler(res, Errors.SERVER_ERROR, error.message);
    }
};
