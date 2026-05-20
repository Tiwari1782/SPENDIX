const pool = require('../db/connection');

// GET /api/tools/:companyId — All tools with waste calculation
const getTools = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const [tools] = await pool.execute(
      `SELECT t.*,
        (SELECT COUNT(*) FROM usage_logs ul
         JOIN employees e ON ul.employee_id = e.id
         WHERE ul.tool_id = t.id AND ul.has_license = TRUE
         AND ul.last_login >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
         AND e.is_active = TRUE) AS active_users,
        (SELECT COUNT(*) FROM usage_logs ul
         JOIN employees e ON ul.employee_id = e.id
         WHERE ul.tool_id = t.id AND ul.has_license = TRUE
         AND (ul.last_login < DATE_SUB(CURDATE(), INTERVAL 60 DAY) OR ul.last_login IS NULL)
         AND e.is_active = TRUE) AS idle_users
       FROM saas_tools t WHERE t.company_id = ? ORDER BY t.tool_name`,
      [companyId]
    );

    const result = tools.map(tool => {
      const activeUsers = parseInt(tool.active_users) || 0;
      const idleUsers = parseInt(tool.idle_users) || 0;
      const totalAssigned = activeUsers + idleUsers;
      const unusedSeats = idleUsers;
      const monthlyWaste = unusedSeats * parseFloat(tool.monthly_cost_per_seat || 0);
      const usagePercent = totalAssigned > 0 ? Math.round((activeUsers / totalAssigned) * 100) : 100;

      let status = 'healthy';
      if (usagePercent < 50) status = 'high_waste';
      else if (usagePercent < 80) status = 'moderate';

      return {
        id: tool.id,
        tool_name: tool.tool_name,
        category: tool.category,
        seats_purchased: tool.seats_purchased,
        monthly_cost_per_seat: parseFloat(tool.monthly_cost_per_seat),
        total_monthly_cost: parseFloat(tool.total_monthly_cost),
        billing_model: tool.billing_model,
        renewal_date: tool.renewal_date,
        auto_renewal: !!tool.auto_renewal,
        active_users: activeUsers,
        unused_seats: unusedSeats,
        monthly_waste: monthlyWaste,
        usage_percent: usagePercent,
        status,
        owner_user_id: tool.owner_user_id,
        is_shadow_it: !!tool.is_shadow_it
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
// GET /api/tools/:toolId/unused — Unused seats per tool
const getUnusedSeats = async (req, res, next) => {
    try {
      const { toolId } = req.params;
  
      const [rows] = await pool.execute(
        `SELECT e.id AS employee_id, e.name, e.email, e.department,
          ul.last_login,
          DATEDIFF(CURDATE(), ul.last_login) AS days_inactive,
          t.monthly_cost_per_seat AS monthly_cost
         FROM usage_logs ul
         JOIN employees e ON ul.employee_id = e.id
         JOIN saas_tools t ON ul.tool_id = t.id
         WHERE ul.tool_id = ? AND ul.has_license = TRUE AND e.is_active = TRUE
         AND (ul.last_login < DATE_SUB(CURDATE(), INTERVAL 60 DAY) OR ul.last_login IS NULL)
         ORDER BY ul.last_login ASC`,
        [toolId]
      );
  
      res.json(rows.map(r => ({
        ...r,
        days_inactive: parseInt(r.days_inactive),
        monthly_cost: parseFloat(r.monthly_cost)
      })));
    } catch (err) {
      next(err);
    }
  };
  
  // POST /api/tools — Add a tool manually
  const addTool = async (req, res, next) => {
    try {
      const {
        company_id, tool_name, category, seats_purchased, monthly_cost_per_seat,
        billing_model, renewal_date, auto_renewal, vendor_contact_email, owner_user_id,
        contract_term_months, total_monthly_cost
      } = req.body;
  
      if (!company_id || !tool_name) {
        return res.status(400).json({ error: true, message: 'company_id and tool_name are required', code: 400 });
      }