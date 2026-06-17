const bcrypt = require('bcryptjs');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function seedTestData() {
  try {
    console.log("Seeding test clinical accounts...");

    // Clear existing test accounts
    await db.query("DELETE FROM users WHERE email IN ('doctor@hms.com', 'patient@hms.com', 'staff@hms.com')");
    console.log("Cleared old test accounts.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    // 1. Insert Doctor User
    const docUserId = uuidv4();
    await db.query(
      "INSERT INTO users (id, role, full_name, email, password_hash) VALUES (?, 'DOCTOR', 'Dr. Sarah Jenkins', 'doctor@hms.com', ?)",
      [docUserId, hashedPassword]
    );

    const doctorId = uuidv4();
    await db.query(
      "INSERT INTO doctors (id, user_id, specialty, license_num, is_available) VALUES (?, ?, 'Cardiology', 'LIC-100204', TRUE)",
      [doctorId, docUserId]
    );

    // 2. Insert Patient User
    const patUserId = uuidv4();
    await db.query(
      "INSERT INTO users (id, role, full_name, email, password_hash) VALUES (?, 'PATIENT', 'John Doe', 'patient@hms.com', ?)",
      [patUserId, hashedPassword]
    );

    const patientId = uuidv4();
    await db.query(
      "INSERT INTO patients (id, user_id, dob, gender, contact_info, emergency_contact) VALUES (?, ?, '1985-05-12', 'Male', ?, 'Jane Doe: 555-0199')",
      [patientId, patUserId, JSON.stringify({ phone: '555-0100', address: '123 Main St, Springfield' })]
    );

    // 2.5 Insert Staff User
    const staffUserId = uuidv4();
    await db.query(
      "INSERT INTO users (id, role, full_name, email, password_hash) VALUES (?, 'STAFF', 'Jane Staff', 'staff@hms.com', ?)",
      [staffUserId, hashedPassword]
    );

    // 3. Insert a Future Confirmed Appointment
    const aptId = uuidv4();
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + 2); // 2 hours from now

    await db.query(
      "INSERT INTO appointments (id, patient_id, doctor_id, scheduled_for, status, triage_symptoms, ai_urgency_score) VALUES (?, ?, ?, ?, 'CONFIRMED', 'Chest tightness and shortness of breath during light workouts. Telemedicine follow-up.', 'HIGH')",
      [aptId, patientId, doctorId, scheduledFor]
    );

    // 4. Insert a Past Completed Appointment (for vitals history)
    const pastAptId = uuidv4();
    const pastScheduledFor = new Date();
    pastScheduledFor.setDate(pastScheduledFor.getDate() - 1); // 1 day ago

    await db.query(
      "INSERT INTO appointments (id, patient_id, doctor_id, scheduled_for, status, triage_symptoms, ai_urgency_score) VALUES (?, ?, ?, ?, 'COMPLETED', 'Routine checkup and vitals assessment.', 'LOW')",
      [pastAptId, patientId, doctorId, pastScheduledFor]
    );

    // 5. Insert Medical Record containing Vitals for John Doe
    const recordId = uuidv4();
    const vitalsData = {
      heartRate: 78,
      bloodPressure: "124/82",
      bloodSugar: 96,
      oxygenSaturation: 98
    };
    await db.query(
      "INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, clinical_notes, ai_generated_summary, vitals) VALUES (?, ?, ?, ?, 'Patient feels good overall. Initial blood pressure is slightly elevated but stable. Heart rate is regular.', 'Fever, cough resolved. Normal cardiology follow-up.', ?)",
      [recordId, patientId, doctorId, pastAptId, JSON.stringify(vitalsData)]
    );

    // 6. Insert an Active Prescription
    const prescId = uuidv4();
    await db.query(
      "INSERT INTO prescriptions (id, medical_record_id, medication_name, dosage, status) VALUES (?, ?, 'Lisinopril 10mg', '1 tablet PO daily', 'ACTIVE')",
      [prescId, recordId]
    );

    console.log("=========================================");
    console.log("Test Clinical Accounts Seeded successfully!");
    console.log("Doctor User: doctor@hms.com / Password123!");
    console.log("Patient User: patient@hms.com / Password123!");
    console.log("Staff User:   staff@hms.com / Password123!");
    console.log("Seeded database records: Vitals & Prescriptions active.");
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed test clinical accounts:", error);
    process.exit(1);
  }
}

seedTestData();
