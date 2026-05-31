const pool = require('../config/db');

// GET /api/business – current user's business profile
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM businesses WHERE user_id=$1', [req.user.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/business/default-format – sets default format
exports.setDefaultFormat = async (req, res) => {
  try {
    const { format_id } = req.body;
    await pool.query(
      `INSERT INTO businesses (user_id, business_name, default_format_id)
       VALUES ($1, '', $2)
       ON CONFLICT (user_id) DO UPDATE SET default_format_id=$2`,
      [req.user.id, format_id || null]
    );
    res.json({ success: true, default_format_id: format_id });
  } catch (err) {
    console.error('setDefaultFormat error:', err);
    res.status(500).json({ error: 'Failed to set default format' });
  }
};

// PUT /api/business – create or update business profile
exports.upsertProfile = async (req, res) => {
  try {
    const { business_name, gst_number, address, phone, email, website } = req.body;
    if (!business_name) return res.status(400).json({ error: 'Business name is required' });

    const result = await pool.query(
      `INSERT INTO businesses (user_id, business_name, gst_number, address, phone, email, website)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id) DO UPDATE SET
         business_name=$2, gst_number=$3, address=$4, phone=$5, email=$6, website=$7
       RETURNING *`,
      [req.user.id, business_name, gst_number||'', address||'', phone||'', email||'', website||'']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('upsertProfile error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
};

// POST /api/business/logo – upload logo
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const logo_url = `/uploads/logos/${req.file.filename}`;

    // Upsert: create row if not exists, then update logo
    await pool.query(
      `INSERT INTO businesses (user_id, business_name, logo_url)
       VALUES ($1, '', $2)
       ON CONFLICT (user_id) DO UPDATE SET logo_url=$2`,
      [req.user.id, logo_url]
    );

    res.json({ logo_url });
  } catch (err) {
    console.error('uploadLogo error:', err);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
};
