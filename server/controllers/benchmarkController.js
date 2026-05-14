const pool = require('../db/connection');

// GET /api/benchmarks/:companyId — Peer benchmark comparison
const getBenchmarks = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const [companies] = await pool.execute(
      'SELECT industry, employee_count_range FROM companies WHERE id = ?', [companyId]
    );
    if (companies.length === 0) {
      return res.status(404).json({ error: true, message: 'Company not found', code: 404 });
    }
    const company = companies[0];

    const [tools] = await pool.execute(
      `SELECT category, COUNT(*) AS tool_count, SUM(total_monthly_cost) AS total_spend
       FROM saas_tools WHERE company_id = ? AND category IS NOT NULL GROUP BY category`, [companyId]
    );

    const [empCount] = await pool.execute(
      'SELECT COUNT(*) AS count FROM employees WHERE company_id = ? AND is_active = TRUE', [companyId]
    );
    const employeeCount = empCount[0].count || 1;

    const [benchmarks] = await pool.execute(
      `SELECT * FROM benchmark_data WHERE (industry = ? OR industry IS NULL) 
       AND (employee_range = ? OR employee_range IS NULL) ORDER BY category`,
      [company.industry, company.employee_count_range]
    );

    const results = [];
    for (const tool of tools) {
      const spend = parseFloat(tool.total_spend);
      const spendPerEmployee = spend / employeeCount;
      const benchmark = benchmarks.find(b => b.category === tool.category);

      let comparison = 'no_benchmark';
      if (benchmark && benchmark.sample_size >= 5) {
        const median = parseFloat(benchmark.median_monthly_spend_per_employee);
        const p75 = parseFloat(benchmark.p75_monthly_spend_per_employee);
        if (spendPerEmployee <= median) comparison = 'below_median';
        else if (spendPerEmployee <= p75) comparison = 'between_median_p75';
        else comparison = 'above_p75';
      }

      results.push({
        category: tool.category,
        tool_count: parseInt(tool.tool_count),
        total_monthly_spend: spend,
        spend_per_employee: Math.round(spendPerEmployee * 100) / 100,
        benchmark: benchmark ? {
          avg_spend_per_employee: parseFloat(benchmark.avg_monthly_spend_per_employee),
          median_spend_per_employee: parseFloat(benchmark.median_monthly_spend_per_employee),
          p75_spend_per_employee: parseFloat(benchmark.p75_monthly_spend_per_employee),
          sample_size: benchmark.sample_size
        } : null,
        comparison
      });
    }

    const overpayingCount = results.filter(r => r.comparison === 'above_p75').length;

    res.json({
      company_industry: company.industry,
      employee_count: employeeCount,
      overpaying_categories: overpayingCount,
      categories: results
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/benchmarks/categories — Available benchmark categories
const getBenchmarkCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT DISTINCT category FROM benchmark_data ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (err) {
    next(err);
  }
};

module.exports = { getBenchmarks, getBenchmarkCategories };
