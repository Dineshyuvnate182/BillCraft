const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ── Dashboard Stats ───────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [users, formats, sales, revenue, bills, monthlyR] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role != 'admin'"),
      pool.query('SELECT COUNT(*) FROM bill_formats'),
      pool.query('SELECT COUNT(*) FROM purchased_formats'),
      pool.query("SELECT COALESCE(SUM(bf.price),0) as total FROM purchased_formats pf JOIN bill_formats bf ON pf.format_id=bf.id"),
      pool.query('SELECT COUNT(*) FROM bills'),
      pool.query(`
        SELECT TO_CHAR(created_at,'Mon') as month,
               EXTRACT(MONTH FROM created_at) as mon_num,
               COUNT(*) as sales,
               COALESCE(SUM(bf.price),0) as revenue
        FROM purchased_formats pf
        JOIN bill_formats bf ON pf.format_id=bf.id
        WHERE pf.purchase_date >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at,'Mon'), EXTRACT(MONTH FROM created_at)
        ORDER BY mon_num
      `),
    ]);
    res.json({
      totalUsers:    Number(users.rows[0].count),
      totalFormats:  Number(formats.rows[0].count),
      totalSales:    Number(sales.rows[0].count),
      totalRevenue:  Number(revenue.rows[0].total),
      totalBills:    Number(bills.rows[0].count),
      monthlyStats:  monthlyR.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stats failed' });
  }
};

// ── User Management ───────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.business_name, u.created_at, u.is_blocked,
              COUNT(DISTINCT b.id) as bill_count,
              COUNT(DISTINCT pf.id) as formats_owned
       FROM users u
       LEFT JOIN bills b ON b.user_id = u.id
       LEFT JOIN purchased_formats pf ON pf.user_id = u.id
       WHERE u.role != 'admin'
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.toggleUserBlock = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_blocked = NOT is_blocked WHERE id=$1 RETURNING id,name,email,is_blocked',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1 AND role != $2', [req.params.id, 'admin']);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'agent'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Role update failed' });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hash, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed' });
  }
};

// ── Format Management ─────────────────────────────────────────────────────────
exports.getAllFormatsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bf.*,
              COUNT(DISTINCT pf.id) as sales_count,
              COALESCE(SUM(bf.price),0) as total_revenue,
              bf.is_featured, bf.status
       FROM bill_formats bf
       LEFT JOIN purchased_formats pf ON pf.format_id = bf.id
       GROUP BY bf.id ORDER BY bf.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch formats' });
  }
};

exports.createFormatAdmin = async (req, res) => {
  try {
    const { name, accent, description, price, icon, tag, color, color2, template_html, status } = req.body;
    const result = await pool.query(
      `INSERT INTO bill_formats (name,accent,description,price,icon,tag,color,color2,template_html,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, accent||'', description||'', price, icon||'🧾', tag||'Standard',
       color||'#6366F1', color2||'#818CF8', template_html||'', status||'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create format' });
  }
};

exports.updateFormat = async (req, res) => {
  try {
    const { name, accent, description, price, icon, tag, color, color2, template_html, status, is_featured } = req.body;
    const result = await pool.query(
      `UPDATE bill_formats SET name=$1,accent=$2,description=$3,price=$4,icon=$5,tag=$6,
       color=$7,color2=$8,template_html=$9,status=$10,is_featured=$11 WHERE id=$12 RETURNING *`,
      [name, accent, description, price, icon, tag, color, color2, template_html, status, is_featured||false, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE bill_formats SET is_featured = NOT is_featured WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.toggleFormatStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      "UPDATE bill_formats SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteFormatAdmin = async (req, res) => {
  try {
    await pool.query('DELETE FROM bill_formats WHERE id=$1', [req.params.id]);
    res.json({ message: 'Format deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

// ── Payment Management ────────────────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pf.*, u.name as user_name, u.email as user_email,
              bf.name as format_name, bf.price, bf.accent
       FROM purchased_formats pf
       JOIN users u ON pf.user_id = u.id
       JOIN bill_formats bf ON pf.format_id = bf.id
       ORDER BY pf.purchase_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// ── Bill Monitoring ───────────────────────────────────────────────────────────
exports.getAllBills = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email,
              bf.name as format_name
       FROM bills b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN bill_formats bf ON b.format_id = bf.id
       ORDER BY b.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

// ── Product Monitoring ────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as owner_name, u.email as owner_email
       FROM products p JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.deleteProductAdmin = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

// ── Analytics ─────────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const [topFormats, topUsers, recentSignups, monthlyBills] = await Promise.all([
      pool.query(
        `SELECT bf.name, bf.accent, bf.icon, bf.color, COUNT(pf.id) as sales
         FROM bill_formats bf LEFT JOIN purchased_formats pf ON bf.id=pf.format_id
         GROUP BY bf.id ORDER BY sales DESC LIMIT 5`
      ),
      pool.query(
        `SELECT u.name, u.email, COUNT(b.id) as bill_count,
                COALESCE(SUM(b.total_amount),0) as total_amount
         FROM users u LEFT JOIN bills b ON b.user_id=u.id
         WHERE u.role != 'admin'
         GROUP BY u.id ORDER BY bill_count DESC LIMIT 5`
      ),
      pool.query(
        `SELECT TO_CHAR(created_at,'DD Mon') as date, COUNT(*) as signups
         FROM users WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY TO_CHAR(created_at,'DD Mon'), DATE(created_at)
         ORDER BY DATE(created_at)`
      ),
      pool.query(
        `SELECT TO_CHAR(created_at,'Mon') as month,
                COUNT(*) as count,
                COALESCE(SUM(total_amount),0) as revenue
         FROM bills WHERE created_at >= NOW() - INTERVAL '6 months'
         GROUP BY TO_CHAR(created_at,'Mon'), EXTRACT(MONTH FROM created_at)
         ORDER BY EXTRACT(MONTH FROM created_at)`
      ),
    ]);
    res.json({
      topFormats:   topFormats.rows,
      topUsers:     topUsers.rows,
      recentSignups: recentSignups.rows,
      monthlyBills: monthlyBills.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analytics failed' });
  }
};
