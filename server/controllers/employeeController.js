const pool = require('../db/connection');

// GET /api/employees/:companyId — All employees
const getEmployees = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const [rows] = await pool.execute(
      `SELECT id, name, email, department, job_title, is_active, deactivated_at
       FROM employees WHERE company_id = ? ORDER BY name`,
      [companyId]
    );
    res.json(rows.map(r => ({ ...r, is_active: !!r.is_active })));
  } catch (err) {
    next(err);
  }
};

// POST /api/employees — Add employee
const addEmployee = async (req, res, next) => {
  try {
    const { company_id, name, email, department, job_title, manager_email } = req.body;

    if (!company_id || !name || !email) {
      return res.status(400).json({ error: true, message: 'company_id, name, and email are required', code: 400 });
    }

    const [result] = await pool.execute(
      `INSERT INTO employees (company_id, name, email, department, job_title, manager_email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_id, name, email, department || null, job_title || null, manager_email || null]
    );

    res.status(201).json({ success: true, id: result.insertId, message: 'Employee added' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/employees/:employeeId/deactivate — Mark as departed
const deactivateEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    // Get employee info
    const [employees] = await pool.execute('SELECT * FROM employees WHERE id = ?', [employeeId]);
    if (employees.length === 0) {
      return res.status(404).json({ error: true, message: 'Employee not found', code: 404 });
    }

    // Deactivate
    await pool.execute(
      'UPDATE employees SET is_active = FALSE, deactivated_at = CURDATE() WHERE id = ?',
      [employeeId]
    );

    // Count active licenses that are now offboarding risks
    const [licenses] = await pool.execute(
      'SELECT COUNT(*) AS count FROM usage_logs WHERE employee_id = ? AND has_license = TRUE',
      [employeeId]
    );

    res.json({
      success: true,
      message: `${employees[0].name} marked as departed`,
      active_licenses_flagged: licenses[0].count
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEmployees, addEmployee, deactivateEmployee };
