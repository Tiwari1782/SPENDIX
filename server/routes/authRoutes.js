const express = require('express');
const router = express.Router();
const { login, logout, getMe, register } = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register — Create new account
router.post('/register', register);

// POST /api/auth/login — Authenticate and set JWT cookie
router.post('/login', login);

// POST /api/auth/logout — Clear JWT cookie
router.post('/logout', logout);

// GET /api/auth/me — Get current authenticated user
router.get('/me', auth, getMe);

module.exports = router;

