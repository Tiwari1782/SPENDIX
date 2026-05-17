const pool = require('../db/connection');

// GET /api/offboarding/:companyId — All ex-employee license flags
const getOffboardingRisks = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const [rows] = await pool.execute(
      `SELECT e.id AS employee_id, e.name, e.email, e.department, e.deactivated_at,
        DATEDIFF(CURDATE(), e.deactivated_at) AS days_since_departure,
        ul.tool_id, t.tool_name, t.monthly_cost_per_seat AS monthly_cost
       FROM usage_logs ul
       JOIN employees e ON ul.employee_id = e.id
       JOIN saas_tools t ON ul.tool_id = t.id
       WHERE e.company_id = ? AND e.is_active = FALSE AND ul.has_license = TRUE
       ORDER BY e.deactivated_at ASC`,
      [companyId]
    );

    // Group by employee
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.employee_id]) {
        grouped[row.employee_id] = {
          employee_id: row.employee_id,
          name: row.name,
          email: row.email,
          department: row.department,
          deactivated_at: row.deactivated_at,
          days_since_departure: parseInt(row.days_since_departure),
          active_tools: [],
          total_monthly_risk: 0
        };
      }
      const cost = parseFloat(row.monthly_cost);
      grouped[row.employee_id].active_tools.push({
        tool_id: row.tool_id,
        tool_name: row.tool_name,
        monthly_cost: cost
      });
      grouped[row.employee_id].total_monthly_risk += cost;
    }

    res.json(Object.values(grouped));
  } catch (err) {
    next(err);
  }
};
// GET /api/tools/:toolId/offboarding — Licenses held by ex-employees for one tool
const getToolOffboarding = async (req, res, next) => {
    try {
      const { toolId } = req.params;
  
      const [rows] = await pool.execute(
        `SELECT e.id AS employee_id, e.name, e.email, e.department, e.deactivated_at,
          DATEDIFF(CURDATE(), e.deactivated_at) AS days_since_departure,
          t.monthly_cost_per_seat AS monthly_cost
         FROM usage_logs ul
         JOIN employees e ON ul.employee_id = e.id
         JOIN saas_tools t ON ul.tool_id = t.id
         WHERE ul.tool_id = ? AND e.is_active = FALSE AND ul.has_license = TRUE
         ORDER BY e.deactivated_at ASC`,
        [toolId]
      );
  
      res.json(rows.map(r => ({
        ...r,
        days_since_departure: parseInt(r.days_since_departure),
        monthly_cost: parseFloat(r.monthly_cost)
      })));
    } catch (err) {
      next(err);
    }
  };
  
  // PUT /api/offboarding/:employeeId/resolve — Revoke all licenses for a departed employee
  const resolveOffboarding = async (req, res, next) => {
    try {
      const { employeeId } = req.params;
  
      // Get employee
      const [employees] = await pool.execute(
        'SELECT name FROM employees WHERE id = ? AND is_active = FALSE',
        [employeeId]
      );
      if (employees.length === 0) {
        return res.status(404).json({ error: true, message: 'Inactive employee not found', code: 404 });
      }
  
      // Get cost of licenses being revoked
      const [licenses] = await pool.execute(
        `SELECT COUNT(*) AS count, COALESCE(SUM(t.monthly_cost_per_seat), 0) AS savings
         FROM usage_logs ul JOIN saas_tools t ON ul.tool_id = t.id
         WHERE ul.employee_id = ? AND ul.has_license = TRUE`,
        [employeeId]
      );
  
      // Revoke all licenses
      await pool.execute(
        'UPDATE usage_logs SET has_license = FALSE WHERE employee_id = ?',
        [employeeId]
      );
  
      res.json({
        success: true,
        licenses_revoked: licenses[0].count,
        monthly_savings: parseFloat(licenses[0].savings),
        message: `All licenses revoked for ${employees[0].name}`
      });
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = { getOffboardingRisks, getToolOffboarding, resolveOffboarding };
  