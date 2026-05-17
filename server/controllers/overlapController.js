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
     // Group by category (only categories with 2+ tools)
     const groups = {};
     for (const tool of categorized) {
       if (!groups[tool.category]) groups[tool.category] = [];
       groups[tool.category].push(tool);
     }
 
     const overlapGroups = [];
     for (const [category, categoryTools] of Object.entries(groups)) {
       if (categoryTools.length < 2) continue;
 
       const combinedCost = categoryTools.reduce(
         (sum, t) => sum + parseFloat(t.total_monthly_cost || 0), 0
       );
 
       // Generate AI recommendation
       const recommendation = await generateOverlapRecommendation(
         categoryTools.map(t => ({ tool_name: t.tool_name, monthly_cost: t.total_monthly_cost }))
       );
 
       const toolIds = categoryTools.map(t => t.id);
 
       // Persist to DB
       const [result] = await pool.execute(
         `INSERT INTO overlap_groups (company_id, category, tool_ids, combined_monthly_cost, recommendation)
          VALUES (?, ?, ?, ?, ?)`,
         [companyId, category, JSON.stringify(toolIds), combinedCost, recommendation]
       );
 
       overlapGroups.push({
         id: result.insertId,
         category,
         tools: categoryTools.map(t => ({ id: t.id, tool_name: t.tool_name, monthly_cost: parseFloat(t.total_monthly_cost) })),
         combined_monthly_cost: combinedCost,
         recommendation
       });
     }
 
     res.json(overlapGroups);
   } catch (err) {
     next(err);
   }
 };
 // POST /api/overlaps/detect — Force re-detection of overlaps
const detectOverlaps = async (req, res, next) => {
    try {
      const { company_id } = req.body;
  
      if (!company_id) {
        return res.status(400).json({ error: true, message: 'company_id is required', code: 400 });
      }
  
      // Clear existing overlap groups for re-detection
      await pool.execute('DELETE FROM overlap_groups WHERE company_id = ?', [company_id]);
  
      // Reuse getOverlaps logic by forwarding
      req.params.companyId = company_id;
  
      const [tools] = await pool.execute(
        'SELECT id, tool_name, total_monthly_cost FROM saas_tools WHERE company_id = ? AND is_shadow_it = FALSE',
        [company_id]
      );
  
      if (tools.length === 0) {
        return res.json({ success: true, groups_found: 0, message: 'No tools to analyze' });
      }
  
      // Categorize each tool via Groq AI
      const categorized = [];
      for (const tool of tools) {
        const category = await categorizeToolName(tool.tool_name);
        categorized.push({ ...tool, category });
      }
  
      // Group by category
      const groups = {};
      for (const tool of categorized) {
        if (!groups[tool.category]) groups[tool.category] = [];
        groups[tool.category].push(tool);
      }
  
      let groupsFound = 0;
      for (const [category, categoryTools] of Object.entries(groups)) {
        if (categoryTools.length < 2) continue;
  
        const combinedCost = categoryTools.reduce(
          (sum, t) => sum + parseFloat(t.total_monthly_cost || 0), 0
        );
  
        const recommendation = await generateOverlapRecommendation(
          categoryTools.map(t => ({ tool_name: t.tool_name, monthly_cost: t.total_monthly_cost }))
        );
  
        const toolIds = categoryTools.map(t => t.id);
  
        await pool.execute(
          `INSERT INTO overlap_groups (company_id, category, tool_ids, combined_monthly_cost, recommendation)
           VALUES (?, ?, ?, ?, ?)`,
          [company_id, category, JSON.stringify(toolIds), combinedCost, recommendation]
        );
  
        groupsFound++;
      }
  
      res.json({ success: true, groups_found: groupsFound, message: 'Overlap detection complete' });
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = { getOverlaps, detectOverlaps };
  