const express = require('express');
const router = express.Router();
const { getIntegrations, connectIntegration, syncIntegration, getIntegrationLogs, disconnectIntegration } = require('../controllers/integrationController');

// POST /api/integrations/connect — Initiate OAuth or save API key (must be before /:param)
router.post('/connect', connectIntegration);

// GET /api/integrations/:companyId — All integration statuses
router.get('/:companyId', getIntegrations);

// POST /api/integrations/:integrationId/sync — Trigger manual sync
router.post('/:integrationId/sync', syncIntegration);

// GET /api/integrations/:integrationId/logs — Sync history and errors
router.get('/:integrationId/logs', getIntegrationLogs);

// DELETE /api/integrations/:integrationId — Disconnect integration
router.delete('/:integrationId', disconnectIntegration);

module.exports = router;
