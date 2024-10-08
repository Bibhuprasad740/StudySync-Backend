// User model
const User = require('../database/models/User');

const { customComparator } = require('../utils/utils');
const dateUtils = require('../utils/dateUtils');
const APIErrorHandler = require('../errors/ApiErrorHandler');
const APISuccessHandler = require('../success/ApiSuccessHandler');
const Errors = require('../errors/Errors');
const Successes = require('../success/Successes');

// Calculates all the revisions
exports.calculateRevision = async (req, res) => {
    try {
        const { email } = req.user;

        // find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return APIErrorHandler(res, Errors.USER_NOT_FOUND_ERROR);
        }

        const userRevisionIntervals = user.revisionIntervals;

        const userStudyData = user.studies;

        const revisionData = {};

        // brute force approach
        for (const singleStudyData of userStudyData) {

            const lastRevisedOn = singleStudyData.lastRevisedOn;

            let difference;
            if (lastRevisedOn === 0) {
                difference = dateUtils.dateDifference(singleStudyData.date);
            } else {
                difference = dateUtils.dateDifference(lastRevisedOn);
            }
            // Determine which revision layer the study item belongs to
            for (let i = 0; i < userRevisionIntervals.length; i++) {
                const layerDuration = userRevisionIntervals[i];

                // If this topic doesn't match current revision layer
                if (singleStudyData.revisionCount > i) continue;

                // Check if enough time has passed
                if (difference >= layerDuration) {

                    // create empty list if subject is not present
                    if (!revisionData[singleStudyData.subject]) {
                        revisionData[singleStudyData.subject] = [];
                    }

                    // feedback when the topic was last revised
                    let value;

                    if (singleStudyData.revisionCount === 0) {
                        value = '-1'
                    } else {
                        value = difference + ' Days ago'
                    }

                    // using revisionData as a set
                    revisionData[singleStudyData.subject].push({
                        topic: singleStudyData.topic,
                        id: singleStudyData.id,
                        lastRevised: value,
                        additionalInfo: singleStudyData.additionalInfo
                    });

                    break;
                }
            }
        }

        // Sort topics within each subject by last revised date
        for (const subject in revisionData) {
            revisionData[subject].sort(customComparator);
        }

        res.status(200).send(revisionData)

    } catch (error) {
        console.error('Error calculating revision:', error);
        return APIErrorHandler(res, Errors.SERVER_ERROR, error.message);
    }
}

// Update revision count for a study data
exports.updateRevisionCount = async (req, res) => {
    try {
        const { email } = req.user;

        // find user in database
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const studyId = req.params.id;

        const today = new Date();

        // update the revision count of the study item whose id is studyId
        const studyItemIndex = user.studies.findIndex(item => item.id === studyId);
        if (studyItemIndex === -1) {
            return APIErrorHandler(res, Errors.INVALID_REQUEST_ERROR, 'Study item not found');
        }

        user.studies[studyItemIndex].revisionCount += 1;
        user.studies[studyItemIndex].lastRevisedOn = today;

        await user.save();

        return APISuccessHandler(res, Successes.TOPIC_REVISED);
    } catch (error) {
        console.error('Error updating study data:', error);
        return APIErrorHandler(res, Errors.SERVER_ERROR, error.message);
    }
}