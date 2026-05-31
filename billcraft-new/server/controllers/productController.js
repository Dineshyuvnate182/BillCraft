const pool = require('../config/db');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM products WHERE user_id=$1';
    const params = [req.user.id];
    if (search) {
      query += ' AND LOWER(product_name) LIKE $2';
      params.push(`%${search.toLowerCase()}%`);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { product_name, price, stock, category, description } = req.body;
    if (!product_name || !price) return res.status(400).json({ error: 'Name and price required' });
    const result = await pool.query(
      `INSERT INTO products (user_id, product_name, price, stock, category, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, product_name, price, stock||0, category||'General', description||'']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { product_name, price, stock, category, description } = req.body;
    const result = await pool.query(
      `UPDATE products SET product_name=$1, price=$2, stock=$3, category=$4, description=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [product_name, price, stock, category, description, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
