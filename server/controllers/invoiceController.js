const pool = require('../db/connection');
const { parseInvoice } = require('../services/groqService');

// POST /api/shadow-it/parse — Parse invoice text via Groq AI
const parseInvoiceText = async (req, res, next) => {
  try {
    const { company_id, invoice_text } = req.body;

    if (!company_id || !invoice_text) {
      return res.status(400).json({ error: true, message: 'company_id and invoice_text are required', code: 400 });
    }

    // Call Groq AI to parse the invoice
    let parsed;
    try {
      parsed = await parseInvoice(invoice_text);
    } catch (err) {
      return res.status(422).json({
        error: true,
        message: 'Could not extract tool information from this text. Please check the invoice format.',
        code: 422
      });
    }

    // Insert into parsed_invoices
    const [result] = await pool.execute(
      `INSERT INTO parsed_invoices (company_id, raw_text, parsed_tool_name, parsed_amount, parsed_seats, parsed_renewal_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending_review')`,
      [company_id, invoice_text, parsed.tool_name, parsed.amount, parsed.seats || null, parsed.renewal_date || null]
    );

    res.json({
      invoice_id: result.insertId,
      parsed: {
        tool_name: parsed.tool_name,
        amount: parsed.amount,
        seats: parsed.seats || null,
        renewal_date: parsed.renewal_date || null
      },
      status: 'pending_review'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { parseInvoiceText };
