const express = require('express');
const router = express.Router();
const { getEmployees, addEmployee, deactivateEmployee } = require('../controllers/employeeController');

// GET /api/employees/:companyId — All employees
router.get('/:companyId', getEmployees);

// POST /api/employees — Add employee
router.post('/', addEmployee);

// PUT /api/employees/:employeeId/deactivate — Mark as departed
router.put('/:employeeId/deactivate', deactivateEmployee);

module.exports = router;
