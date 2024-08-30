const express = require('express');
const router = express.Router();

// controller imports
const { ping } = require('../controllers/userController')

/**
 * @authed
 * Ping route to keep track of daily login of users
 * /data/all
 */
router.post('/ping', ping);

module.exports = router;