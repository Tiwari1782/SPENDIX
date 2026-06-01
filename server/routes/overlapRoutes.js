const express = require('express');
const router = express.Router();
const { getOverlaps, detectOverlaps } = require('../controllers/overlapController');

// GET /api/overlaps/:companyId — Tool overlap groups with combined cost
router.get('/:companyId', getOverlaps);

// POST /api/overlaps/detect — Force re-detection of overlaps
router.post('/detect', detectOverlaps);

module.exports = router;
