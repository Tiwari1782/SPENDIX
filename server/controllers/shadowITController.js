const pool = require('../db/connection');

// GET /api/shadow-it/:companyId — All shadow IT invoices pending review
const getShadowIT = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const [rows] = await pool.execute(
      `SELECT id, parsed_tool_name, parsed_amount, parsed_seats, parsed_renewal_date, status, created_at
       FROM parsed_invoices WHERE company_id = ? AND status = 'pending_review'
       ORDER BY created_at DESC`,
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// PUT /api/shadow-it/:invoiceId/add — Approve and add to official SaaS stack
const addShadowIT = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    // Get the parsed invoice
    const [invoices] = await pool.execute(
      'SELECT * FROM parsed_invoices WHERE id = ?', [invoiceId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ error: true, message: 'Invoice not found', code: 404 });
    }

    const invoice = invoices[0];

    if (invoice.status !== 'pending_review') {
      return res.status(400).json({ error: true, message: 'Invoice already processed', code: 400 });
    }