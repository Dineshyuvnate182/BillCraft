const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'billcraft_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, business_name } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name,email,password,business_name) VALUES($1,$2,$3,$4) RETURNING id,name,email,business_name,role',
      [name, email, hash, business_name || '']
    );
    const user = result.rows[0];
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password: _, ...safeUser } = user;
    res.json({ token: signToken(safeUser), user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,name,email,business_name,role,created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, business_name } = req.body;
    const result = await pool.query(
      'UPDATE users SET name=$1, business_name=$2 WHERE id=$3 RETURNING id,name,email,business_name,role',
      [name, business_name, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// POST /api/auth/setup-admin
// Creates or resets admin@billcraft.com / admin123
// Visit http://localhost:5000/api/auth/setup-admin (POST) once if admin login fails
exports.setupAdmin = async (req, res) => {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, business_name, role)
       VALUES ('Admin', 'admin@billcraft.com', $1, 'BillCraft HQ', 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password = $1, role = 'admin', name = 'Admin'`,
      [hash]
    );
    res.json({ message: 'Admin ready — email: admin@billcraft.com  password: admin123' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Setup failed: ' + err.message });
  }
};
