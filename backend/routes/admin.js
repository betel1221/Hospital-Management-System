const express = require('express');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyToken);
router.use(requireRole(['ADMIN']));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics for Admin
// @access  Private (Admin Only)
router.get('/stats', async (req, res) => {
  try {
    const [userCounts] = await db.query(
      "SELECT role, COUNT(*) as count FROM users GROUP BY role"
    );
    const [appointmentCount] = await db.query(
      "SELECT COUNT(*) as count FROM appointments"
    );

    const stats = {
      ADMIN: 0,
      DOCTOR: 0,
      PATIENT: 0,
      STAFF: 0,
      appointments: appointmentCount[0].count || 0
    };

    userCounts.forEach(item => {
      if (stats[item.role] !== undefined) {
        stats[item.role] = item.count;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard statistics' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users in the system
// @access  Private (Admin Only)
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, role, full_name, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    console.error('Admin Users List Error:', error);
    res.status(500).json({ message: 'Server error retrieving user list' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role
// @access  Private (Admin Only)
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!role || !['ADMIN', 'DOCTOR', 'PATIENT', 'STAFF'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided' });
  }

  // Prevent changing own admin role or removing the last admin
  if (userId === req.userId && role !== 'ADMIN') {
    return res.status(400).json({ message: 'You cannot change your own admin role.' });
  }

  try {
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Admin Update Role Error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin Only)
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (userId === req.userId) {
    return res.status(400).json({ message: 'You cannot delete your own admin account.' });
  }

  try {
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;
