const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Apply auth middleware to all patient routes
router.use(verifyToken);

// @route   GET /api/patients
// @desc    Get all patients in the system
// @access  Private (Doctor or Staff only)
router.get('/', async (req, res) => {
  if (req.userRole === 'PATIENT') {
    return res.status(403).json({ message: 'Forbidden. Patients cannot access patient list.' });
  }

  try {
    const [patients] = await db.query(`
      SELECT p.id, p.dob, p.gender, p.contact_info, p.emergency_contact,
             u.full_name as name, u.email, u.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.full_name ASC
    `);

    // Fetch the latest medical records (to see their primary condition, last visit, etc.)
    const patientsWithStats = await Promise.all(patients.map(async (pat) => {
      const [records] = await db.query(`
        SELECT clinical_notes, vitals, created_at
        FROM medical_records
        WHERE patient_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [pat.id]);

      let condition = 'Healthy / No symptoms';
      let lastVisit = 'None';
      let vitals = null;

      if (records.length > 0) {
        vitals = records[0].vitals;
        lastVisit = new Date(records[0].created_at).toLocaleDateString();
        
        // Very basic condition extractor from clinical notes (or default)
        const notes = records[0].clinical_notes || '';
        if (notes.toLowerCase().includes('diabetes')) condition = 'Type 2 Diabetes';
        else if (notes.toLowerCase().includes('hypertension') || notes.toLowerCase().includes('blood pressure')) condition = 'Hypertension';
        else if (notes.toLowerCase().includes('asthma')) condition = 'Asthma';
        else if (notes.toLowerCase().includes('flu') || notes.toLowerCase().includes('cold')) condition = 'Flu Symptoms';
        else if (notes.toLowerCase().includes('injury')) condition = 'Sports Injury';
        else if (notes.toLowerCase().includes('checkup') || notes.toLowerCase().includes('annual')) condition = 'General Checkup';
      }

      return {
        ...pat,
        condition,
        lastVisit,
        vitals,
        age: pat.dob ? new Date().getFullYear() - new Date(pat.dob).getFullYear() : 35 // default age fallback
      };
    }));

    res.json(patientsWithStats);
  } catch (error) {
    console.error('Fetch Patients Error:', error);
    res.status(500).json({ message: 'Server error retrieving patients list' });
  }
});

// @route   GET /api/patients/profile
// @desc    Get current patient's own profile and latest vitals
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    let patientId;
    if (req.userRole === 'PATIENT') {
      const [patients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.userId]);
      if (patients.length === 0) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      patientId = patients[0].id;
    } else {
      return res.status(400).json({ message: 'Only patient role can access patient/profile endpoint' });
    }

    const [patientData] = await db.query(`
      SELECT p.*, u.full_name as name, u.email
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [patientId]);

    // Fetch the latest medical records / vitals
    const [records] = await db.query(`
      SELECT vitals, clinical_notes, created_at
      FROM medical_records
      WHERE patient_id = ? AND vitals IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `, [patientId]);

    res.json({
      profile: patientData[0],
      vitalsHistory: records
    });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get details of a specific patient
// @access  Private (Doctor or Staff only)
router.get('/:id', async (req, res) => {
  if (req.userRole === 'PATIENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const patientId = req.params.id;

  try {
    const [patientData] = await db.query(`
      SELECT p.*, u.full_name as name, u.email
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [patientId]);

    if (patientData.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patientData[0]);
  } catch (error) {
    console.error('Fetch Patient Error:', error);
    res.status(500).json({ message: 'Server error retrieving patient' });
  }
});

// @route   GET /api/patients/:id/medical-records
// @desc    Get full medical records of a patient
// @access  Private (Doctor, Staff, or the Patient themselves)
router.get('/:id/medical-records', async (req, res) => {
  const patientId = req.params.id;

  try {
    // If user is a patient, make sure they are only fetching their own medical record
    if (req.userRole === 'PATIENT') {
      const [patients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.userId]);
      if (patients.length === 0 || patients[0].id !== patientId) {
        return res.status(403).json({ message: 'Forbidden. You can only access your own records.' });
      }
    }

    const [records] = await db.query(`
      SELECT mr.*, ud.full_name as doctor_name
      FROM medical_records mr
      LEFT JOIN doctors d ON mr.doctor_id = d.id
      LEFT JOIN users ud ON d.user_id = ud.id
      WHERE mr.patient_id = ?
      ORDER BY mr.created_at DESC
    `, [patientId]);

    res.json(records);
  } catch (error) {
    console.error('Fetch Medical Records Error:', error);
    res.status(500).json({ message: 'Server error retrieving medical records' });
  }
});

// @route   POST /api/patients/:id/medical-records
// @desc    Create a new medical record (clinical notes/vitals)
// @access  Private (Doctor only)
router.post('/:id/medical-records', async (req, res) => {
  if (req.userRole !== 'DOCTOR') {
    return res.status(403).json({ message: 'Only doctors can add medical records' });
  }

  const patientId = req.params.id;
  const { appointmentId, clinicalNotes, aiGeneratedSummary, vitals } = req.body;

  try {
    // Find doctor record
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.userId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    const doctorId = doctors[0].id;

    const recordId = uuidv4();
    await db.query(`
      INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, clinical_notes, ai_generated_summary, vitals)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      recordId, 
      patientId, 
      doctorId, 
      appointmentId || null, 
      clinicalNotes || '', 
      aiGeneratedSummary || null, 
      vitals ? JSON.stringify(vitals) : null
    ]);

    res.status(201).json({ message: 'Medical record created successfully', recordId });
  } catch (error) {
    console.error('Create Medical Record Error:', error);
    res.status(500).json({ message: 'Server error creating medical record' });
  }
});

// @route   PUT /api/patients/profile
// @desc    Update current patient's profile (dob, gender, contact_info, emergency_contact)
// @access  Private (Patient only)
router.put('/profile', async (req, res) => {
  if (req.userRole !== 'PATIENT') {
    return res.status(403).json({ message: 'Only patients can update their patient profile information.' });
  }

  const { dob, gender, phone, address, emergencyContact } = req.body;

  try {
    const [patients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.userId]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    const patientId = patients[0].id;

    const contactInfo = JSON.stringify({ phone: phone || '', address: address || '' });

    await db.query(`
      UPDATE patients
      SET dob = ?, gender = ?, contact_info = ?, emergency_contact = ?
      WHERE id = ?
    `, [dob || null, gender || null, contactInfo, emergencyContact || null, patientId]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
