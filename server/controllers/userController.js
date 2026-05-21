const pool = require('../db/connection');
const bcrypt = require('bcryptjs');

// GET /api/users/:companyId — All platform users
const getUsers = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, company_id, name, email, role, department, last_login, created_at FROM platform_users WHERE company_id = ? ORDER BY name',
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/users — Invite a new platform user
const inviteUser = async (req, res, next) => {
  try {
    const { company_id, name, email, role, department, password } = req.body;

    if (!company_id || !email || !name) {
      return res.status(400).json({ error: true, message: 'company_id, name, and email are required', code: 400 });
    }

    // Check if email already exists
    const [existing] = await pool.execute('SELECT id FROM platform_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: true, message: 'User with this email already exists', code: 409 });
    }

    // Generate a default password if not provided
    const userPassword = password || 'spendix123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userPassword, salt);

    const [result] = await pool.execute(
      `INSERT INTO platform_users (company_id, name, email, password_hash, role, department)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_id, name, email, hash, role || 'read_only', department || null]
    );

    res.status(201).json({ success: true, id: result.insertId, message: `User invited: ${email}` });
  } catch (err) {
    next(err);
  }
};
// PUT /api/users/:userId/role — Update role assignment
const updateUserRole = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
  
      const validRoles = ['it_admin', 'finance_viewer', 'dept_head', 'read_only'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ error: true, message: `role must be one of: ${validRoles.join(', ')}`, code: 400 });
      }
  
      const [result] = await pool.execute(
        'UPDATE platform_users SET role = ? WHERE id = ?', [role, userId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'User not found', code: 404 });
      }
  
      res.json({ success: true, message: 'Role updated' });
    } catch (err) {
      next(err);
    }
  };
  
  // DELETE /api/users/:userId — Remove user access
  const removeUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
  
      const [result] = await pool.execute('DELETE FROM platform_users WHERE id = ?', [userId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'User not found', code: 404 });
      }
  
      res.json({ success: true, message: 'User removed' });
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = { getUsers, inviteUser, updateUserRole, removeUser };
  