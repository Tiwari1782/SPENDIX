const express = require('express');
const router = express.Router();
const { parseInvoiceText } = require('../controllers/invoiceController');

// POST /api/invoices/parse — Parse invoice text (alternate route)
router.post('/parse', parseInvoiceText);

module.exports = router;
