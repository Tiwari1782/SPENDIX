const express = require('express');
const router = express.Router();
const { getOffboardingRisks, resolveOffboarding } = require('../controllers/offboardingController');

// GET /api/offboarding/:companyId — All ex-employee license flags
router.get('/:companyId', getOffboardingRisks);

// PUT /api/offboarding/:employeeId/resolve — Revoke all licenses for a departed employee
router.put('/:employeeId/resolve', resolveOffboarding);

module.exports = router;
