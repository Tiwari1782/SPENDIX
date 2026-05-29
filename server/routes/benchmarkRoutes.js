const express = require('express');
const router = express.Router();
const { getBenchmarks, getBenchmarkCategories } = require('../controllers/benchmarkController');

// GET /api/benchmarks/categories — Available benchmark categories (must be before /:companyId)
router.get('/categories', getBenchmarkCategories);

// GET /api/benchmarks/:companyId — Peer benchmark comparison
router.get('/:companyId', getBenchmarks);

module.exports = router;
