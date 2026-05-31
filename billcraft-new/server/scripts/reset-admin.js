/**
 * Run this once to fix / create the admin account:
 *   node server/scripts/reset-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const pool   = require('../config/db');

async function resetAdmin() {
  try {
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const email    = process.env.ADMIN_EMAIL    || 'admin@billcraft.com';
    const name     = 'Admin';

    const hash = await bcrypt.hash(password, 10);

    // Upsert: update if exists, insert if not
    const result = await pool.query(
      `INSERT INTO users (name, email, password, business_name, role)
       VALUES ($1, $2, $3, 'BillCraft HQ', 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password = EXCLUDED.password,
             role     = 'admin',
             name     = EXCLUDED.name
       RETURNING id, name, email, role`,
      [name, email, hash]
    );

    console.log('✅ Admin account ready:');
    console.log('   Email   :', result.rows[0].email);
    console.log('   Password:', password);
    console.log('   Role    :', result.rows[0].role);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

resetAdmin();
