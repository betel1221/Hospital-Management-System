const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  try {
    // 1. Connect without selecting a database so we can create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
    });

    console.log("Connected to local XAMPP MySQL server...");
    
    // 2. Create the Database if it doesn't exist
    const dbName = process.env.DB_NAME || 'hms_2026';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' ensured.`);
    
    // 3. Switch to the newly created database
    await connection.query(`USE \`${dbName}\`;`);

    // 4. Create Tables
    console.log("Creating tables...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        role ENUM('ADMIN', 'DOCTOR', 'PATIENT', 'STAFF') NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE,
        dob DATE,
        gender VARCHAR(50),
        contact_info JSON,
        emergency_contact TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE,
        specialty VARCHAR(100),
        license_num VARCHAR(100),
        is_available BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36),
        doctor_id VARCHAR(36),
        scheduled_for DATETIME NOT NULL,
        status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        triage_symptoms TEXT,
        ai_urgency_score VARCHAR(10),
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36),
        doctor_id VARCHAR(36),
        appointment_id VARCHAR(36),
        clinical_notes TEXT,
        ai_generated_summary TEXT,
        vitals JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id VARCHAR(36) PRIMARY KEY,
        medical_record_id VARCHAR(36),
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        status ENUM('ACTIVE', 'DISPENSED') DEFAULT 'ACTIVE',
        FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
      )
    `);

    console.log("All tables successfully initialized in MySQL!");
    process.exit(0);
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  }
}

initDB();
