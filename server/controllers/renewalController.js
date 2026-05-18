const pool = require('../db/connection');

// GET /api/renewals/:companyId — Tools renewing in next 90 days
const getRenewals = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const [rows] = await pool.execute(
      `SELECT t.id, t.tool_name, t.renewal_date, t.auto_renewal,
        t.total_monthly_cost AS monthly_cost,
        (t.total_monthly_cost * 12) AS annual_cost,
        DATEDIFF(t.renewal_date, CURDATE()) AS days_until_renewal
       FROM saas_tools t
       WHERE t.company_id = ?
       AND t.renewal_date IS NOT NULL
       AND t.renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
       ORDER BY t.renewal_date ASC`,
      [companyId]
    );

    const result = rows.map(r => {
      const days = parseInt(r.days_until_renewal);
      let urgency = 'planned';
      if (days <= 30) urgency = 'urgent';
      else if (days <= 60) urgency = 'upcoming';

      return {
        id: r.id,
        tool_name: r.tool_name,
        renewal_date: r.renewal_date,
        days_until_renewal: days,
        auto_renewal: !!r.auto_renewal,
        monthly_cost: parseFloat(r.monthly_cost),
        annual_cost: parseFloat(r.annual_cost),
        urgency
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/renewals/trigger-alerts — Manually trigger renewal alert emails
const triggerAlerts = async (req, res, next) => {
  try {
    // Dynamically import alertService to avoid circular dependency issues
    const { processRenewalAlerts } = require('../services/alertService');
    const alertsSent = await processRenewalAlerts();
    res.json({ success: true, alerts_sent: alertsSent, message: 'Renewal alerts dispatched' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRenewals, triggerAlerts };
