const dotenv = require('dotenv');

dotenv.config();

const studyController = require('./controllers/studyController');
const print = require('./utils/print');

// get revisions from file

// add a new topic to the database
// console.log(studyController.addStudyData({
//     'topic': 'Random topic for test',
//     'subject': 'OS',
//     'additionalInfo': 'Video no. 1.1, page no. 1-6'
// }))

// update revision count for a topic
// console.log(studyController.updateRevisionCount(1));

// get revision topics
print(studyController.calculateRevision())
