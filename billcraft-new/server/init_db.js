const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function initDB() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'billcraft',
    user: process.env.DB_USER || 'my_user',
    password: process.env.DB_PASSWORD || '123',
  });

  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📜 Executing schema SQL queries...');

    // Run schema script
    await pool.query(schemaSql);
    console.log('✅ Schema SQL queries applied successfully!');

    // Ensure permissions granted if postgres superuser is accessible
    try {
      const superuserPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'billcraft',
        user: 'postgres',
        password: process.env.DB_PASSWORD || '123',
      });
      await superuserPool.query(`
        ALTER TABLE IF EXISTS users OWNER TO ${process.env.DB_USER || 'my_user'};
        ALTER TABLE IF EXISTS bill_formats OWNER TO ${process.env.DB_USER || 'my_user'};
        ALTER TABLE IF EXISTS purchased_formats OWNER TO ${process.env.DB_USER || 'my_user'};
        ALTER TABLE IF EXISTS products OWNER TO ${process.env.DB_USER || 'my_user'};
        ALTER TABLE IF EXISTS bills OWNER TO ${process.env.DB_USER || 'my_user'};
        ALTER TABLE IF EXISTS bill_items OWNER TO ${process.env.DB_USER || 'my_user'};
        ALTER TABLE IF EXISTS businesses OWNER TO ${process.env.DB_USER || 'my_user'};
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${process.env.DB_USER || 'my_user'};
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${process.env.DB_USER || 'my_user'};
        GRANT ALL PRIVILEGES ON SCHEMA public TO ${process.env.DB_USER || 'my_user'};
      `);
      await superuserPool.end();
      console.log('🔑 Database permissions verified and granted.');
    } catch (permErr) {
      console.log('ℹ️ Privilege grant check note:', permErr.message);
    }

    // Verify tables created
    const res = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('📊 Active database tables:', res.rows.map(r => r.tablename).join(', '));

  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDB();
