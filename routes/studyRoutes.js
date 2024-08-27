const express = require('express');
const router = express.Router();

// import controllers
const { getAllStudyData, addStudyData } = require('../controllers/studyController');

/**
 * @authed
 * Used to get all the revisions
 * /data/all
 */
router.get('/all', getAllStudyData);

/**
 * @authed
 * Used to add a new study data
 * /revision/add
 */
router.post('/add', addStudyData);

module.exports = router;