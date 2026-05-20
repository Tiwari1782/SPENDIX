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