const pool = require('../db/connection');

// GET /api/integrations/:companyId — All integration statuses
const getIntegrations = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, company_id, integration_type, status, last_synced_at, sync_error_message, created_at FROM integrations WHERE company_id = ?',
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/integrations/connect — Initiate OAuth or save API key
const connectIntegration = async (req, res, next) => {
  try {
    const { company_id, integration_type, credentials } = req.body;

    if (!company_id || !integration_type) {
      return res.status(400).json({ error: true, message: 'company_id and integration_type are required', code: 400 });
    }

    // Upsert integration record
    const [existing] = await pool.execute(
      'SELECT id FROM integrations WHERE company_id = ? AND integration_type = ?',
      [company_id, integration_type]
    );

    if (existing.length > 0) {
      await pool.execute(
        "UPDATE integrations SET status = 'connected', credentials_encrypted = ?, sync_error_message = NULL WHERE id = ?",
        [JSON.stringify(credentials || {}), existing[0].id]
      );
      res.json({ success: true, integration_id: existing[0].id, message: `${integration_type} connected` });
    } else {
      const [result] = await pool.execute(
        `INSERT INTO integrations (company_id, integration_type, status, credentials_encrypted)
         VALUES (?, ?, 'connected', ?)`,
        [company_id, integration_type, JSON.stringify(credentials || {})]
      );
      res.status(201).json({ success: true, integration_id: result.insertId, message: `${integration_type} connected` });
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/integrations/:integrationId/sync — Trigger manual sync
const syncIntegration = async (req, res, next) => {
  try {
    const { integrationId } = req.params;

    const [integrations] = await pool.execute('SELECT * FROM integrations WHERE id = ?', [integrationId]);
    if (integrations.length === 0) {
      return res.status(404).json({ error: true, message: 'Integration not found', code: 404 });
    }

    const integration = integrations[0];