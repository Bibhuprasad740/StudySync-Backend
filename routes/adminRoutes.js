const express = require('express');
const router = express.Router();

// controller import
const { makeAdmin } = require('../controllers/adminController');

// admin middleware
const adminMiddleware = require('../middlewares/adminMiddleware');

/**
 * @authed
 * @adminOnly
 * Used to make a user an admin
 * /admin/makeAdmin
 */
router.post('/makeAdmin', adminMiddleware, makeAdmin);

module.exports = router;