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
// GET /api/forecast/:toolId/history — Historical spend snapshots for a tool
const getToolHistory = async (req, res, next) => {
    try {
      const { toolId } = req.params;
  
      const [rows] = await pool.execute(
        `SELECT ss.*, t.tool_name FROM spend_snapshots ss
         JOIN saas_tools t ON ss.tool_id = t.id
         WHERE ss.tool_id = ? ORDER BY ss.snapshot_month ASC`,
        [toolId]
      );
  
      res.json(rows.map(r => ({
        ...r,
        actual_spend: parseFloat(r.actual_spend),
        consumption_units: r.consumption_units ? parseFloat(r.consumption_units) : null
      })));
    } catch (err) {
      next(err);
    }
  };
  
  // POST /api/forecast/:companyId/generate — Trigger Groq forecast generation
  const generateForecasts = async (req, res, next) => {
    try {
      const { companyId } = req.params;
  
      // Get all tools
      const [tools] = await pool.execute(
        'SELECT id, tool_name FROM saas_tools WHERE company_id = ?',
        [companyId]
      );
  
      let forecastsGenerated = 0;
  
      for (const tool of tools) {
        // Get historical snapshots (minimum 3 needed)
        const [snapshots] = await pool.execute(
          `SELECT snapshot_month, actual_spend, seats_used FROM spend_snapshots
           WHERE tool_id = ? ORDER BY snapshot_month ASC`,
          [tool.id]
        );
  
        if (snapshots.length < 3) continue; // Skip tools without enough history
  
        try {
          const result = await generateSpendForecast(tool.tool_name, snapshots.map(s => ({
            snapshot_month: s.snapshot_month,
            actual_spend: parseFloat(s.actual_spend),
            seats_used: s.seats_used
          })));
    // Clear old forecasts for this tool
    await pool.execute(
        'DELETE FROM spend_forecasts WHERE tool_id = ? AND company_id = ?',
        [tool.id, companyId]
      );

      // Insert new forecasts
      if (result.projections && result.projections.length > 0) {
        for (const proj of result.projections) {
          await pool.execute(
            `INSERT INTO spend_forecasts (tool_id, company_id, forecast_month, projected_spend, confidence_level, forecast_basis)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tool.id, companyId, proj.month, proj.projected_spend, proj.confidence_level || 'medium', result.forecast_basis || '']
          );
        }
        forecastsGenerated++;
      }
    } catch (aiErr) {
      console.error(`Forecast generation failed for ${tool.tool_name}:`, aiErr.message);
      // Continue with other tools
    }
  }

  res.json({
    success: true,
    tools_forecasted: forecastsGenerated,
    message: `Generated forecasts for ${forecastsGenerated} tools`
  });
} catch (err) {
  next(err);
}
};

// POST /api/forecast/snapshot — Record a monthly spend snapshot
const addSnapshot = async (req, res, next) => {
try {
  const { tool_id, company_id, snapshot_month, actual_spend, seats_used, consumption_units, consumption_unit_label } = req.body;

  if (!tool_id || !company_id || !snapshot_month || actual_spend === undefined) {
    return res.status(400).json({ error: true, message: 'tool_id, company_id, snapshot_month, and actual_spend are required', code: 400 });
  }

  const [result] = await pool.execute(
    `INSERT INTO spend_snapshots (tool_id, company_id, snapshot_month, actual_spend, seats_used, consumption_units, consumption_unit_label)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE actual_spend = VALUES(actual_spend), seats_used = VALUES(seats_used),
     consumption_units = VALUES(consumption_units), consumption_unit_label = VALUES(consumption_unit_label)`,
    [tool_id, company_id, snapshot_month, actual_spend, seats_used || null, consumption_units || null, consumption_unit_label || null]
  );

  res.status(201).json({ success: true, id: result.insertId, message: 'Snapshot recorded' });
} catch (err) {
  next(err);
}
};

module.exports = { getForecasts, getToolHistory, generateForecasts, addSnapshot };
