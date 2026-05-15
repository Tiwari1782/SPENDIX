const pool = require('../db/connection');
const { generateSpendForecast } = require('../services/groqService');

// GET /api/forecast/:companyId — All tool forecasts for next quarter
const getForecasts = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Get all tools with their latest forecasts
    const [tools] = await pool.execute(
      'SELECT id, tool_name, total_monthly_cost FROM saas_tools WHERE company_id = ?',
      [companyId]
    );

    const results = [];
    for (const tool of tools) {
      // Get latest snapshot for "last month actual"
      const [latestSnapshot] = await pool.execute(
        `SELECT actual_spend FROM spend_snapshots 
         WHERE tool_id = ? ORDER BY snapshot_month DESC LIMIT 1`,
        [tool.id]
      );

      // Get forecasts
      const [forecasts] = await pool.execute(
        `SELECT forecast_month, projected_spend, confidence_level, forecast_basis
         FROM spend_forecasts WHERE tool_id = ? AND company_id = ?
         ORDER BY forecast_month ASC`,
        [tool.id, companyId]
      );

      results.push({
        tool_id: tool.id,
        tool_name: tool.tool_name,
        current_monthly_cost: parseFloat(tool.total_monthly_cost),
        last_month_actual: latestSnapshot.length > 0 ? parseFloat(latestSnapshot[0].actual_spend) : null,
        forecasts: forecasts.map(f => ({
          forecast_month: f.forecast_month,
          projected_spend: parseFloat(f.projected_spend),
          confidence_level: f.confidence_level,
          forecast_basis: f.forecast_basis
        }))
      });
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
};
