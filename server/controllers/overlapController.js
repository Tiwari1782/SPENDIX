const pool = require('../db/connection');
const { categorizeToolName, generateOverlapRecommendation } = require('../services/groqService');

// GET /api/overlaps/:companyId — Detect and return tool overlap groups
const getOverlaps = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Check for existing overlap groups first
    const [existing] = await pool.execute(
      'SELECT * FROM overlap_groups WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );

    if (existing.length > 0) {
      // Enrich with tool details
      const enriched = await Promise.all(existing.map(async (group) => {
        const toolIds = typeof group.tool_ids === 'string' ? JSON.parse(group.tool_ids) : group.tool_ids;
        const placeholders = toolIds.map(() => '?').join(',');
        const [tools] = await pool.execute(
          `SELECT id, tool_name, total_monthly_cost AS monthly_cost FROM saas_tools WHERE id IN (${placeholders})`,
          toolIds
        );
        return {
          id: group.id,
          category: group.category,
          tools,
          combined_monthly_cost: parseFloat(group.combined_monthly_cost),
          recommendation: group.recommendation
        };
      }));
      return res.json(enriched);
    }

    // No existing groups — run AI detection
    const [tools] = await pool.execute(
      'SELECT id, tool_name, total_monthly_cost FROM saas_tools WHERE company_id = ? AND is_shadow_it = FALSE',
      [companyId]
    );

    if (tools.length === 0) {
      return res.json([]);
    }

    // Categorize each tool via Groq AI
    const categorized = [];
    for (const tool of tools) {
      const category = await categorizeToolName(tool.tool_name);
      categorized.push({ ...tool, category });
    }