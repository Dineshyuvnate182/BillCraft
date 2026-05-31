const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'SmartBill',
  user:     process.env.DB_USER     || '23510036',
  password: process.env.DB_PASSWORD || 'prn@123',
});

pool.on('connect', () => console.log('✅ Database connected'));
pool.on('error',   (err) => console.error('❌ DB Error:', err));

module.exports = pool;
