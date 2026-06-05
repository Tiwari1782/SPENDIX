const express = require('express');
const router = express.Router();
const { getUsers, inviteUser, updateUserRole, removeUser } = require('../controllers/userController');

// GET /api/users/:companyId — All platform users
router.get('/:companyId', getUsers);

// POST /api/users — Invite a new platform user
router.post('/', inviteUser);

// PUT /api/users/:userId/role — Update role assignment
router.put('/:userId/role', updateUserRole);

// DELETE /api/users/:userId — Remove user access
router.delete('/:userId', removeUser);

module.exports = router;
