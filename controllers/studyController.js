const fs = require('fs');

const dateUtils = require('../utils/dateUtils');

const data = fs.readFileSync('./data/data.json', 'utf8');
const parsedData = JSON.parse(data);

const studyData = parsedData.studyData;

exports.getAllStudyData = (req, res) => {
    try {
        res.status(200).json(studyData);
    } catch (error) {
        console.error('Error in getAllStudyData()', error);
        res.status(500).json({ message: error.message });
    }
}

// Add new study data
exports.addStudyData = (req, res) => {
    try {
        const studyObject = req.body;
        const id = parseInt(parsedData.count) + 1;

        const today = new Date();
        const date = dateUtils.formatDate(today);

        const newStudyData = {
            ...studyObject,
            id,
            date,
            revisionCount: 0,
            lastRevisedOn: 0
        }

        // Add newStudyData key value pair to studyData object
        studyData[id] = newStudyData;

        parsedData.count = id;
        parsedData.studyData = studyData;

        // Write the updated array back to the file
        fs.writeFileSync('./data/data.json', JSON.stringify(parsedData, null, 2));

        res.status(201).json({
            message: 'Study data added successfully'
        });
    } catch (error) {
        console.error('Error adding study data:', error);
        res.status(500).send({ message: 'Failed to add study data' });
    }
}