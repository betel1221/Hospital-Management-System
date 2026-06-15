const bcrypt = require('bcryptjs');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function setupAdmin() {
  try {
    console.log("Starting Admin account setup...");

    // 1. Delete all existing admin accounts
    const [delResult] = await db.query("DELETE FROM users WHERE role = 'ADMIN' OR email = 'admin@hms.com'");
    console.log(`Deleted existing admin accounts/emails: ${delResult.affectedRows} row(s) removed.`);

    // 2. Define secure Admin credentials
    const adminEmail = 'admin@hms.com';
    const adminPassword = 'HMSAdmin@2026!SecurePortal';
    const adminFullName = 'Master Administrator';

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 4. Insert the new Admin
    const adminId = uuidv4();
    await db.query(
      "INSERT INTO users (id, role, full_name, email, password_hash) VALUES (?, 'ADMIN', ?, ?, ?)",
      [adminId, adminFullName, adminEmail, hashedPassword]
    );

    console.log("=========================================");
    console.log("Master Admin Account Created Successfully!");
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("Failed to setup master admin:", error);
    process.exit(1);
  }
}

setupAdmin();
