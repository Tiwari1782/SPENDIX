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