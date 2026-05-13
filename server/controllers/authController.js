const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
require('dotenv').config();

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required', code: 400 });
    }

    // Find platform user
    const [users] = await pool.execute(
      'SELECT * FROM platform_users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: true, message: 'Invalid email or password', code: 401 });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: true, message: 'Invalid email or password', code: 401 });
    }

    // Update last_login
    await pool.execute('UPDATE platform_users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });
  res.json({ success: true, message: 'Logged out' });
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, department, company_id FROM platform_users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: true, message: 'Unauthorized', code: 401 });
    }

    res.json(users[0]);
  } catch (err) {
    next(err);
  }
};
// POST /api/auth/register — Create a new account (company + user)
const register = async (req, res, next) => {
    try {
      const { name, email, password, company_name, company_domain, industry, employee_count_range, role } = req.body;
  
      if (!name || !email || !password || !company_name) {
        return res.status(400).json({ error: true, message: 'name, email, password, and company_name are required', code: 400 });
      }
  
      // Check if email already exists
      const [existing] = await pool.execute('SELECT id FROM platform_users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: true, message: 'An account with this email already exists', code: 409 });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
  
      // Create company
      const [companyResult] = await pool.execute(
        'INSERT INTO companies (name, domain, industry, employee_count_range) VALUES (?, ?, ?, ?)',
        [company_name, company_domain || null, industry || null, employee_count_range || null]
      );
      const companyId = companyResult.insertId;
  
      // Map role string to enum value
      const roleMap = { 'IT Admin': 'it_admin', 'Finance Head': 'finance_viewer', 'Operations': 'dept_head' };
      const userRole = roleMap[role] || 'it_admin';
  
      // Create platform user
      const [userResult] = await pool.execute(
        'INSERT INTO platform_users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [companyId, name, email, hash, userRole]
      );
  
      const userId = userResult.insertId;
  
      // Generate JWT and set cookie
      const token = jwt.sign(
        { id: userId, email, role: userRole, company_id: companyId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
  
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
  
      res.status(201).json({
        success: true,
        user: { id: userId, name, email, role: userRole },
        company_id: companyId
      });
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = { login, logout, getMe, register };
  