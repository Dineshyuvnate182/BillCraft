const pool = require('./config/db');

async function migrate() {
  try {
    await pool.query(`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS default_format_id INT REFERENCES bill_formats(id) ON DELETE SET NULL;`);
    console.log('Migration successful: Added default_format_id to businesses table.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrate();
