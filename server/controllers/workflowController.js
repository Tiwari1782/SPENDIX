const pool = require('../db/connection');
const { generateWorkflowTasks } = require('../services/groqService');

// GET /api/workflows/:companyId — All active workflow instances
const getWorkflows = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const [rows] = await pool.execute(
      `SELECT wi.*, e.name AS employee_name, e.department, e.email AS employee_email,
        (SELECT COUNT(*) FROM workflow_tasks WHERE workflow_instance_id = wi.id) AS total_tasks,
        (SELECT COUNT(*) FROM workflow_tasks WHERE workflow_instance_id = wi.id AND status = 'completed') AS completed_tasks
       FROM workflow_instances wi
       JOIN employees e ON wi.employee_id = e.id
       WHERE wi.company_id = ?
       ORDER BY wi.created_at DESC`,
      [companyId]
    );

    res.json(rows.map(r => ({
      ...r,
      total_tasks: parseInt(r.total_tasks),
      completed_tasks: parseInt(r.completed_tasks)
    })));
  } catch (err) {
    next(err);
  }
};

// GET /api/workflows/:instanceId/tasks — Tasks for a specific workflow
const getWorkflowTasks = async (req, res, next) => {
  try {
    const { instanceId } = req.params;

    const [rows] = await pool.execute(
      `SELECT wt.*, t.tool_name
       FROM workflow_tasks wt
       LEFT JOIN saas_tools t ON wt.tool_id = t.id
       WHERE wt.workflow_instance_id = ?
       ORDER BY wt.id ASC`,
      [instanceId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};