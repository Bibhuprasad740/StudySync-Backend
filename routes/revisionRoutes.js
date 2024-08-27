const express = require('express');
const router = express.Router();

const { calculateRevision, addStudyData, updateRevisionCount } = require('../controllers/revisionController');

/**
 * @authed
 * Used to get all the revisions
 * /revision/all
 */
router.get('/all', calculateRevision);

/**
 * @authed
 * Used to add a new study data
 * /revision/update/<id>
 */
router.put('/revise/:id', updateRevisionCount);

module.exports = router;