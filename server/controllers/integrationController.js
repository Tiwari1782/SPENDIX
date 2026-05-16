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
    
    // Simulate sync — in production this would call the actual API
    const recordsSynced = Math.floor(Math.random() * 50) + 5;

    // Log the sync
    await pool.execute(
      `INSERT INTO integration_sync_logs (integration_id, sync_type, records_synced, status)
       VALUES (?, 'full_sync', ?, 'success')`,
      [integrationId, recordsSynced]
    );

    // Update last synced
    await pool.execute(
      'UPDATE integrations SET last_synced_at = NOW(), sync_error_message = NULL WHERE id = ?',
      [integrationId]
    );

    res.json({
      success: true,
      records_synced: recordsSynced,
      message: `${integration.integration_type} synced successfully`
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/integrations/:integrationId/logs — Sync history and errors
const getIntegrationLogs = async (req, res, next) => {
  try {
    const { integrationId } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM integration_sync_logs WHERE integration_id = ? ORDER BY synced_at DESC LIMIT 20',
      [integrationId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/integrations/:integrationId — Disconnect integration
const disconnectIntegration = async (req, res, next) => {
  try {
    const { integrationId } = req.params;

    const [result] = await pool.execute(
      "UPDATE integrations SET status = 'disconnected', credentials_encrypted = NULL WHERE id = ?",
      [integrationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Integration not found', code: 404 });
    }

    res.json({ success: true, message: 'Integration disconnected' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getIntegrations, connectIntegration, syncIntegration, getIntegrationLogs, disconnectIntegration };
