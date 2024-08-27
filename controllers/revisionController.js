const fs = require('fs');

const dateUtils = require('../utils/dateUtils');
const { customComparator } = require('../utils/utils');

const data = fs.readFileSync('./data/data.json', 'utf8');
const parsedData = JSON.parse(data);

const studyData = parsedData.studyData;

// Calculates all the revisions
exports.calculateRevision = (req, res) => {
    try {
        const { LAYER_DURATIONS } = process.env;

        const layerDurations = JSON.parse(LAYER_DURATIONS);

        const revisionData = {};

        // brute force approach
        for (const id in studyData) {
            const singleStudyData = studyData[id];

            const lastRevisedOn = singleStudyData.lastRevisedOn;

            let difference;
            if (lastRevisedOn === 0) {
                difference = dateUtils.dateDifference(singleStudyData.date);
            } else {
                difference = dateUtils.dateDifference(lastRevisedOn);
            }
            // Determine which revision layer the study item belongs to
            for (let i = 0; i < layerDurations.length; i++) {
                const layerDuration = layerDurations[i];

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
        res.status(500).send({ message: 'Error reading the file' });
    }
}

// Update revision count for a study data
exports.updateRevisionCount = (req, res) => {
    try {
        const studyId = parseInt(req.params.id);
        const revisionDate = new Date();
        const today = dateUtils.formatDate(revisionDate);

        studyData[studyId].revisionCount += 1;
        studyData[studyId].lastRevisedOn = today;

        parsedData.studyData = studyData;

        // Write the updated array back to the file
        fs.writeFileSync('./data/data.json', JSON.stringify(parsedData, null, 2));

        res.status(200).json({
            message: 'Study data updated successfully'
        });
    } catch (error) {
        console.error('Error updating study data:', error);
        res.status(500).send({ message: 'Failed to update study data' });
    }
}