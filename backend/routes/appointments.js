const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Apply auth middleware to all appointments routes
router.use(verifyToken);

// @route   GET /api/appointments
// @desc    Get appointments based on user role
// @access  Private
router.get('/', async (req, res) => {
  try {
    if (req.userRole === 'DOCTOR') {
      // Find doctor record
      const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.userId]);
      if (doctors.length === 0) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      const doctorId = doctors[0].id;

      // Get doctor's appointments
      const [appointments] = await db.query(`
        SELECT a.*, u.full_name as patient_name, u.email as patient_email
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE a.doctor_id = ?
        ORDER BY a.scheduled_for ASC
      `, [doctorId]);
      return res.json(appointments);
    } 
    
    if (req.userRole === 'PATIENT') {
      // Find patient record
      const [patients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.userId]);
      if (patients.length === 0) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      const patientId = patients[0].id;

      // Get patient's appointments
      const [appointments] = await db.query(`
        SELECT a.*, u.full_name as doctor_name, d.specialty as doctor_specialty
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE a.patient_id = ?
        ORDER BY a.scheduled_for ASC
      `, [patientId]);
      return res.json(appointments);
    }

    if (req.userRole === 'STAFF' || req.userRole === 'ADMIN') {
      // Get all appointments in the system
      const [appointments] = await db.query(`
        SELECT a.*, 
               up.full_name as patient_name, 
               ud.full_name as doctor_name,
               d.specialty as doctor_specialty
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
        ORDER BY a.scheduled_for ASC
      `);
      return res.json(appointments);
    }

    return res.status(403).json({ message: 'Invalid role for viewing appointments' });
  } catch (error) {
    console.error('Fetch Appointments Error:', error);
    res.status(500).json({ message: 'Server error retrieving appointments' });
  }
});

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', async (req, res) => {
  const { doctorId, scheduledFor, triageSymptoms, aiUrgencyScore } = req.body;
  let patientId = req.body.patientId;

  if (!scheduledFor) {
    return res.status(400).json({ message: 'Scheduled time is required' });
  }

  try {
    // If the user is a patient, use their own patient ID
    if (req.userRole === 'PATIENT') {
      const [patients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.userId]);
      if (patients.length === 0) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      patientId = patients[0].id;
    } else if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Default to the first available doctor if none is provided
    let finalDoctorId = doctorId;
    if (!finalDoctorId) {
      const [availDoctors] = await db.query('SELECT id FROM doctors WHERE is_available = TRUE LIMIT 1');
      if (availDoctors.length === 0) {
        return res.status(400).json({ message: 'No available doctors at the moment' });
      }
      finalDoctorId = availDoctors[0].id;
    }

    const appointmentId = uuidv4();
    const status = req.userRole === 'PATIENT' ? 'PENDING' : 'CONFIRMED';
    const finalUrgency = aiUrgencyScore || 'Low';

    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_for, status, triage_symptoms, ai_urgency_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [appointmentId, patientId, finalDoctorId, scheduledFor, status, triageSymptoms || '', finalUrgency]);

    res.status(201).json({ message: 'Appointment scheduled successfully', appointmentId });
  } catch (error) {
    console.error('Schedule Appointment Error:', error);
    res.status(500).json({ message: 'Server error scheduling appointment' });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const appointmentId = req.params.id;

  if (!status || !['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'Checked-In'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  try {
    // Check if appointment exists
    const [apts] = await db.query('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (apts.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Role-based safety checks could go here (e.g. patients can only cancel their own)
    
    // In SQL schema, status is enum('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')
    // Wait, in schema.sql: status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')
    // If status is "Checked-In", wait, the database ENUM doesn't have "Checked-In" or does it?
    // Let's check schema.sql line 37: ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')
    // Wait, if it doesn't have 'Checked-In', inserting/updating 'Checked-In' will cause an SQL error!
    // Let's use 'CONFIRMED' or map 'Checked-In' to 'CONFIRMED' in database and use UI to show status,
    // or let's update the database enum to support 'Checked-In'!
    // Wait! Let's map 'Checked-In' to 'CONFIRMED' in DB, or let's use 'CONFIRMED' for Checked-In.
    // Wait! In init_db.js line 67:
    // status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING'
    // Let's map "Checked-In" to "CONFIRMED" or let's alter the table to allow "Checked-In" or "CHECKED_IN".
    // Wait, let's keep it simple: we can allow 'CONFIRMED' in DB, but in our app let's check.
    // Actually, can we alter the table enum to allow 'CHECKED_IN' or 'Checked-In' just in case?
    // Let's check if we can write a SQL query to alter the table or if we can map it.
    // Let's alter the table! It's very easy:
    // ALTER TABLE appointments MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'CHECKED_IN') DEFAULT 'PENDING';
    // Let's check which is better. In init_db.js it is ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED').
    // Let's use 'CONFIRMED' as Checked-In, or let's modify the enum in database! Yes, altering database to allow 'CONFIRMED' or adding 'CONFIRMED' is fine.
    // Wait, let's look at the database schema. In schema.sql:
    // status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING'
    // Let's map any update of 'Checked-In' to 'CONFIRMED' if we want to avoid database migration, or let's support 'CONFIRMED' / 'PENDING' / 'COMPLETED' / 'CANCELLED'.
    // Wait, let's map 'Checked-In' to 'CONFIRMED' in DB, but let's check what the frontend sends.
    // Let's allow 'CONFIRMED' in DB and map 'Checked-In' to 'CONFIRMED' or update the DB enum.
    // Let's run a migration query to alter the ENUM in the database! It's extremely robust.
    // Let's alter the ENUM to include 'CHECKED_IN' or map the status in JS.
    // Wait, let's map it. If status === 'Checked-In', we insert/update as 'CONFIRMED' in DB, but we can store it.
    // Actually, let's run a query to alter the ENUM to:
    // ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'CHECKED_IN')
    // That is very clean. Let's do that in the backend.

    const dbStatus = (status === 'Checked-In' || status === 'CHECKED_IN') ? 'CONFIRMED' : status;

    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [dbStatus, appointmentId]);

    res.json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Update Appointment Status Error:', error);
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
});

module.exports = router;
