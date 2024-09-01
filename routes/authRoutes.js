const express = require('express');
const router = express.Router();

// controller imports
const { signup, signin, logout, signinWithGoogle } = require('../controllers/authController');

// auth middleware
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @notauthed
 * Used to sign in a user
 * /auth/signin
 */
router.post('/signin', signin);

/**
 * @notauthed
 * Used to sign in a user using Google OAuth2
 * /auth/google-signin
 */
router.post('/google-signin', signinWithGoogle);

/**
 * @notauthed
 * Used to create a new user
 * /auth/signup
 */
router.post('/signup', signup);

/**
 * @authed
 * Used to log out a user
 * /auth/logout
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;