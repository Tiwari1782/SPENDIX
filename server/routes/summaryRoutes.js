const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/summaryController');

// GET /api/summary/:companyId — Total spend, waste, savings potential
router.get('/:companyId', getSummary);

module.exports = router;
