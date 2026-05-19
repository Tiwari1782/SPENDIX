const pool = require('../db/connection');

// GET /api/summary/:companyId — Dashboard summary with all key metrics
const getSummary = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Total monthly spend
    const [spendRows] = await pool.execute(
      'SELECT COALESCE(SUM(total_monthly_cost), 0) AS total FROM saas_tools WHERE company_id = ?',
      [companyId]
    );
    const totalMonthlySpend = parseFloat(spendRows[0].total);

    // Total monthly waste (idle seats × cost per seat)
    const [wasteRows] = await pool.execute(
      `SELECT COALESCE(SUM(t.monthly_cost_per_seat), 0) AS waste
       FROM usage_logs ul
       JOIN employees e ON ul.employee_id = e.id
       JOIN saas_tools t ON ul.tool_id = t.id
       WHERE t.company_id = ? AND ul.has_license = TRUE AND e.is_active = TRUE
       AND (ul.last_login < DATE_SUB(CURDATE(), INTERVAL 60 DAY) OR ul.last_login IS NULL)`,
      [companyId]
    );
    const totalMonthlyWaste = parseFloat(wasteRows[0].waste);

    // Tool and employee counts
    const [toolCount] = await pool.execute(
      'SELECT COUNT(*) AS count FROM saas_tools WHERE company_id = ?', [companyId]
    );
    const [empCount] = await pool.execute(
      'SELECT COUNT(*) AS total, SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS inactive FROM employees WHERE company_id = ?',
      [companyId]
    );

    // Shadow IT count (pending review)
    const [shadowCount] = await pool.execute(
      "SELECT COUNT(*) AS count FROM parsed_invoices WHERE company_id = ? AND status = 'pending_review'",
      [companyId]
    );