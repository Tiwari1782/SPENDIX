const express = require('express');
const router = express.Router();
const { parseInvoiceText } = require('../controllers/invoiceController');
const { getShadowIT, addShadowIT, ignoreShadowIT } = require('../controllers/shadowITController');

// POST /api/shadow-it/parse — Parse invoice text using Groq
router.post('/parse', parseInvoiceText);

// GET /api/shadow-it/:companyId — All shadow IT tools pending review
router.get('/:companyId', getShadowIT);

// PUT /api/shadow-it/:invoiceId/add — Approve and add to official stack
router.put('/:invoiceId/add', addShadowIT);

// PUT /api/shadow-it/:invoiceId/ignore — Mark as reviewed and ignore
router.put('/:invoiceId/ignore', ignoreShadowIT);

module.exports = router;
