const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { role, fullName, email, password } = req.body;

  if (!role || !fullName || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        'INSERT INTO users (id, role, full_name, email, password_hash) VALUES (?, ?, ?, ?, ?)',
        [userId, role, fullName, email, hashedPassword]
      );

      if (role === 'PATIENT') {
        const patientId = uuidv4();
        // Insert with default dob/gender/emergency_contact/contact_info
        await conn.query(
          'INSERT INTO patients (id, user_id, dob, gender, contact_info, emergency_contact) VALUES (?, ?, NULL, NULL, ?, NULL)',
          [patientId, userId, JSON.stringify({ phone: '', address: '' })]
        );
      } else if (role === 'DOCTOR') {
        const doctorId = uuidv4();
        // Insert with default specialty/license_num
        await conn.query(
          'INSERT INTO doctors (id, user_id, specialty, license_num, is_available) VALUES (?, ?, ?, ?, TRUE)',
          [doctorId, userId, 'General Practice', 'LIC-' + Math.floor(100000 + Math.random() * 90000)]
        );
      }

      await conn.commit();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token payload
    const payload = {
      id: user.id,
      role: user.role
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            fullName: user.full_name,
            role: user.role,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
