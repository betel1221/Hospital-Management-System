const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Apply auth middleware to all prescriptions routes
router.use(verifyToken);

// @route   GET /api/prescriptions
// @desc    Get prescriptions based on user role
// @access  Private
router.get('/', async (req, res) => {
  try {
    if (req.userRole === 'DOCTOR') {
      // Find doctor profile
      const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.userId]);
      if (doctors.length === 0) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      const doctorId = doctors[0].id;

      const [prescriptions] = await db.query(`
        SELECT pr.*, 
               u_pat.full_name as patient_name,
               u_pat.email as patient_email,
               p.id as patient_id
        FROM prescriptions pr
        JOIN medical_records mr ON pr.medical_record_id = mr.id
        JOIN patients p ON mr.patient_id = p.id
        JOIN users u_pat ON p.user_id = u_pat.id
        WHERE mr.doctor_id = ?
        ORDER BY mr.created_at DESC
      `, [doctorId]);
      return res.json(prescriptions);
    }

    if (req.userRole === 'PATIENT') {
      // Find patient profile
      const [patients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.userId]);
      if (patients.length === 0) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      const patientId = patients[0].id;

      const [prescriptions] = await db.query(`
        SELECT pr.*, 
               u_doc.full_name as doctor_name,
               d.specialty as doctor_specialty
        FROM prescriptions pr
        JOIN medical_records mr ON pr.medical_record_id = mr.id
        JOIN doctors d ON mr.doctor_id = d.id
        JOIN users u_doc ON d.user_id = u_doc.id
        WHERE mr.patient_id = ?
        ORDER BY mr.created_at DESC
      `, [patientId]);
      return res.json(prescriptions);
    }

    if (req.userRole === 'STAFF' || req.userRole === 'ADMIN') {
      // Return all prescriptions
      const [prescriptions] = await db.query(`
        SELECT pr.*, 
               u_pat.full_name as patient_name,
               u_doc.full_name as doctor_name
        FROM prescriptions pr
        JOIN medical_records mr ON pr.medical_record_id = mr.id
        JOIN patients p ON mr.patient_id = p.id
        JOIN users u_pat ON p.user_id = u_pat.id
        JOIN doctors d ON mr.doctor_id = d.id
        JOIN users u_doc ON d.user_id = u_doc.id
        ORDER BY mr.created_at DESC
      `);
      return res.json(prescriptions);
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (error) {
    console.error('Fetch Prescriptions Error:', error);
    res.status(500).json({ message: 'Server error retrieving prescriptions' });
  }
});

// @route   POST /api/prescriptions
// @desc    Create a new prescription
// @access  Private (Doctor only)
router.post('/', async (req, res) => {
  const { patientId, medicationName, dosage } = req.body;

  if (req.userRole !== 'DOCTOR') {
    return res.status(403).json({ message: 'Only doctors can write prescriptions' });
  }

  if (!patientId || !medicationName || !dosage) {
    return res.status(400).json({ message: 'Please provide patientId, medicationName, and dosage' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Find doctor record
    const [doctors] = await conn.query('SELECT id FROM doctors WHERE user_id = ?', [req.userId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    const doctorId = doctors[0].id;

    // Create a dummy medical record to link the prescription to
    const medicalRecordId = uuidv4();
    await conn.query(`
      INSERT INTO medical_records (id, patient_id, doctor_id, clinical_notes)
      VALUES (?, ?, ?, ?)
    `, [medicalRecordId, patientId, doctorId, `Prescription written for ${medicationName}`]);

    // Insert prescription
    const prescriptionId = uuidv4();
    await conn.query(`
      INSERT INTO prescriptions (id, medical_record_id, medication_name, dosage, status)
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `, [prescriptionId, medicalRecordId, medicationName, dosage]);

    await conn.commit();
    res.status(201).json({ message: 'Prescription created successfully', prescriptionId });
  } catch (error) {
    await conn.rollback();
    console.error('Create Prescription Error:', error);
    res.status(500).json({ message: 'Server error creating prescription' });
  } finally {
    conn.release();
  }
});

// @route   PUT /api/prescriptions/:id/dispense
// @desc    Mark a prescription as dispensed
// @access  Private (Doctor or Staff)
router.put('/:id/dispense', async (req, res) => {
  const prescriptionId = req.params.id;

  try {
    const [prescriptions] = await db.query('SELECT * FROM prescriptions WHERE id = ?', [prescriptionId]);
    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    await db.query('UPDATE prescriptions SET status = "DISPENSED" WHERE id = ?', [prescriptionId]);
    res.json({ message: 'Prescription marked as dispensed successfully' });
  } catch (error) {
    console.error('Dispense Prescription Error:', error);
    res.status(500).json({ message: 'Server error updating prescription status' });
  }
});

module.exports = router;
