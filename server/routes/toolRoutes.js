const express = require('express');
const router = express.Router();
const { getTools, getUnusedSeats, addTool, updateTool } = require('../controllers/toolController');
const { getToolOffboarding } = require('../controllers/offboardingController');

// GET /api/tools/:companyId — All tools with waste calculation
router.get('/:companyId', getTools);

// GET /api/tools/:toolId/unused — Unused seats per tool
router.get('/:toolId/unused', getUnusedSeats);

// GET /api/tools/:toolId/offboarding — Licenses held by ex-employees for one tool
router.get('/:toolId/offboarding', getToolOffboarding);

// POST /api/tools — Add a tool manually
router.post('/', addTool);

// PUT /api/tools/:toolId — Update tool details
router.put('/:toolId', updateTool);

module.exports = router;
