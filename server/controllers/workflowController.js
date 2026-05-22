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
// POST /api/workflows/trigger — Trigger onboarding/offboarding workflow
const triggerWorkflow = async (req, res, next) => {
    try {
      const { company_id, employee_id, trigger_type, triggered_by } = req.body;
  
      if (!company_id || !employee_id || !trigger_type) {
        return res.status(400).json({ error: true, message: 'company_id, employee_id, and trigger_type are required', code: 400 });
      }
  
      // Get employee info
      const [employees] = await pool.execute(
        'SELECT * FROM employees WHERE id = ? AND company_id = ?',
        [employee_id, company_id]
      );
      if (employees.length === 0) {
        return res.status(404).json({ error: true, message: 'Employee not found', code: 404 });
      }
      const employee = employees[0];
  
      // Check for existing template
      const [templates] = await pool.execute(
        `SELECT * FROM workflow_templates 
         WHERE company_id = ? AND trigger_type = ? AND (department = ? OR department IS NULL)
         ORDER BY department DESC LIMIT 1`,
        [company_id, trigger_type, employee.department]
      );
  
      // Get tools relevant to this employee
      const [tools] = await pool.execute(
        `SELECT DISTINCT t.id, t.tool_name FROM saas_tools t
         JOIN usage_logs ul ON ul.tool_id = t.id
         WHERE ul.employee_id = ? AND ul.has_license = TRUE`,
        [employee_id]
      );
  
      // If no tools found, get all company tools
      let toolsForWorkflow = tools;
      if (tools.length === 0) {
        const [allTools] = await pool.execute(
          'SELECT id, tool_name FROM saas_tools WHERE company_id = ?',
          [company_id]
        );
        toolsForWorkflow = allTools;
      }
  
      // Create workflow instance
      const [instanceResult] = await pool.execute(
        `INSERT INTO workflow_instances (template_id, company_id, employee_id, trigger_type, status, triggered_by)
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [templates.length > 0 ? templates[0].id : null, company_id, employee_id, trigger_type, triggered_by || null]
      );
      const instanceId = instanceResult.insertId;
  