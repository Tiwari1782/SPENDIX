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
     // Create a new SaaS tool from the parsed invoice data
     const [toolResult] = await pool.execute(
        `INSERT INTO saas_tools (company_id, tool_name, seats_purchased, monthly_cost_per_seat, total_monthly_cost,
         billing_model, renewal_date, is_shadow_it, added_by)
         VALUES (?, ?, ?, ?, ?, 'flat_rate', ?, TRUE, 'invoice_parse')`,
        [
          invoice.company_id,
          invoice.parsed_tool_name,
          invoice.parsed_seats || 0,
          invoice.parsed_seats ? (invoice.parsed_amount / invoice.parsed_seats) : 0,
          invoice.parsed_amount,
          invoice.parsed_renewal_date
        ]
      );
  
      // Update invoice status
      await pool.execute(
        "UPDATE parsed_invoices SET status = 'added' WHERE id = ?", [invoiceId]
      );
  
      res.json({
        success: true,
        tool_id: toolResult.insertId,
        message: `${invoice.parsed_tool_name} added to your SaaS stack`
      });
    } catch (err) {
      next(err);
    }
  };
  
  // PUT /api/shadow-it/:invoiceId/ignore — Mark as reviewed and ignore
  const ignoreShadowIT = async (req, res, next) => {
    try {
      const { invoiceId } = req.params;
  
      const [result] = await pool.execute(
        "UPDATE parsed_invoices SET status = 'ignored' WHERE id = ? AND status = 'pending_review'",
        [invoiceId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'Invoice not found or already processed', code: 404 });
      }
  
      res.json({ success: true, message: 'Invoice marked as ignored' });
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = { getShadowIT, addShadowIT, ignoreShadowIT };
  