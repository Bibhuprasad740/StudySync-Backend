const jwt = require('jsonwebtoken');

// User model
const User = require('../database/models/User');

const dateUtils = require('../utils/dateUtils');

// Get all study data for a user
exports.getAllStudyData = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.studies);
    } catch (error) {
        console.error('Error in getAllStudyData()', error);
        res.status(500).json({ message: error.message });
    }
}

// Add new study data
exports.addStudyData = async (req, res) => {
    try {
        // Await the user fetch operation
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { topic, subject, additionalInfo, date } = req.body;

        if (!topic || !subject) {
            return res.status(400).json({ message: 'Topic and subject are required' });
        }

        // Check if user has exceeded the daily limit
        // TODO: Add security check for admin => admin token
        if (user.role !== 'admin' && user.purchaseData.currentPlan === 'inactive') {
            if (user.dailyStudyCount >= process.env.FREE_DAILY_STUDY_COUNT) {
                return res.status(403).json({ message: 'Daily study limit reached for free plan' });
            }
        } else if (user.role !== 'admin' && user.purchaseData.currentPlan === 'active') {
            const purchaseHistory = user.purchaseData.purchaseHistory;
            if (!purchaseHistory || purchaseHistory.length === 0) {
                return res.status(400).json({ message: 'Purchase history not found! Please contact support!' });
            }

            const lastPurchase = purchaseHistory[purchaseHistory.length - 1];
            try {
                const data = jwt.verify(lastPurchase, process.env.PURCHASE_SECRET);
                const dailyStudyLimit = data.dailyStudyLimit;
                if (user.dailyStudyCount >= dailyStudyLimit) {
                    return res.status(403).json({ message: 'Daily study limit reached for this plan!' });
                }
            } catch (error) {
                // lock the account for next 3 months
                user.isLocked = true;
                user.lockUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                await user.save();  // Ensure user is saved after modification
                return res.status(403).json({ message: 'Account locked due to invalid subscription!' });
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
                return res.status(400).json({ message: 'Invalid date format' });
            }

            // check if the study date is in future
            if (new Date(date) > new Date()) {
                return res.status(400).json({ message: 'Study date cannot be in future!' });
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
        res.status(500).send({ message: 'Failed to add study data' });
    }
};
