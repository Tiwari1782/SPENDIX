const express = require('express');
const router = express.Router();
const { getWorkflows, getWorkflowTasks, triggerWorkflow, updateTask, getTemplates, createTemplate } = require('../controllers/workflowController');

// GET /api/workflows/templates/:companyId — All workflow templates (must be before /:companyId)
router.get('/templates/:companyId', getTemplates);

// POST /api/workflows/templates — Create a new workflow template
router.post('/templates', createTemplate);

// GET /api/workflows/:companyId — All active workflow instances
router.get('/:companyId', getWorkflows);

// GET /api/workflows/:instanceId/tasks — Tasks for a specific workflow
router.get('/:instanceId/tasks', getWorkflowTasks);

// POST /api/workflows/trigger — Trigger onboarding/offboarding workflow
router.post('/trigger', triggerWorkflow);

// PUT /api/workflows/tasks/:taskId — Mark a task complete or skipped
router.put('/tasks/:taskId', updateTask);

module.exports = router;
