const express = require('express');
const router = express.Router();
const { getRenewals, triggerAlerts } = require('../controllers/renewalController');

// GET /api/renewals/:companyId — Tools renewing in next 90 days
router.get('/:companyId', getRenewals);

// POST /api/renewals/trigger-alerts — Manually trigger renewal alert emails
router.post('/trigger-alerts', triggerAlerts);

module.exports = router;
