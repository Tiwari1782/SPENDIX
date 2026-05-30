const express = require('express');
const router = express.Router();
const { getForecasts, getToolHistory, generateForecasts, addSnapshot } = require('../controllers/forecastController');

// GET /api/forecast/:companyId — All tool forecasts
router.get('/:companyId', getForecasts);

// GET /api/forecast/:toolId/history — Historical spend snapshots
router.get('/:toolId/history', getToolHistory);

// POST /api/forecast/:companyId/generate — Trigger Groq forecast generation
router.post('/:companyId/generate', generateForecasts);

// POST /api/forecast/snapshot — Record a monthly spend snapshot
router.post('/snapshot', addSnapshot);

module.exports = router;
