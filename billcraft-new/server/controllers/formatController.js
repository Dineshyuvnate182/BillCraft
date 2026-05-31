const pool = require('../config/db');

// GET /api/formats
exports.getAllFormats = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bill_formats ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch formats' });
  }
};

// GET /api/formats/purchased
exports.getPurchased = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bf.id, bf.name, bf.accent, bf.description, bf.price, bf.icon, bf.tag, bf.color, bf.color2, pf.purchase_date 
       FROM bill_formats bf
       JOIN purchased_formats pf ON bf.id = pf.format_id
       WHERE pf.user_id = $1 ORDER BY pf.purchase_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchased formats' });
  }
};

// POST /api/formats/purchase/:id  (mock payment)
exports.purchaseFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const fmt = await pool.query('SELECT * FROM bill_formats WHERE id=$1', [id]);
    if (!fmt.rows.length) return res.status(404).json({ error: 'Format not found' });

    const result = await pool.query(
      `INSERT INTO purchased_formats (user_id, format_id, payment_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, format_id) DO NOTHING
       RETURNING *`,
      [req.user.id, id, 'pay_mock_' + Date.now()]
    );
    res.json({ message: 'Format purchased successfully', format: fmt.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Purchase failed' });
  }
};

// POST /api/formats  (admin)
exports.createFormat = async (req, res) => {
  try {
    const { name, accent, description, price, icon, tag, color, color2, template_html } = req.body;
    const result = await pool.query(
      `INSERT INTO bill_formats (name,accent,description,price,icon,tag,color,color2,template_html)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, accent, description, price, icon||'🧾', tag||'Standard', color||'#6366F1', color2||'#818CF8', template_html||'']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create format' });
  }
};

// DELETE /api/formats/:id  (admin)
exports.deleteFormat = async (req, res) => {
  try {
    await pool.query('DELETE FROM bill_formats WHERE id=$1', [req.params.id]);
    res.json({ message: 'Format deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

const Handlebars = require('handlebars');

// GET /api/formats/:id/preview
exports.getPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const fmt = await pool.query('SELECT name, color, color2, icon, template_html FROM bill_formats WHERE id=$1', [id]);
    if (!fmt.rows.length) return res.status(404).send('Format not found');

    const f = fmt.rows[0];
    let html = '';

    const dummyContext = {
      business_name: 'Your Awesome Business',
      business_email: 'hello@yourbusiness.com',
      business_phone: '+91 98765 43210',
      business_address: '123 Business Street, City',
      business_gst: '22AAAAA0000A1Z5',
      logo_url: '', // Empty uses icon
      invoice_no: 'INV-1001',
      date: new Date().toLocaleDateString('en-IN'),
      customer_name: 'Rahul Sharma',
      customer_email: 'rahul@example.com',
      items: [
        { name: 'Premium Service Contract', quantity: 1, price: '5,000.00', total: '5,000.00' },
        { name: 'Support Add-on', quantity: 2, price: '1,500.00', total: '3,000.00' }
      ],
      subtotal: '8,000.00',
      gst_amount: '1,440.00',
      total_amount: '9,440.00',
      notes: 'Thank you for choosing us!',
      color: f.color || '#6366F1',
      color2: f.color2 || '#EC4899'
    };

    if (f.template_html) {
      const template = Handlebars.compile(f.template_html);
      html = template(dummyContext);
    } else {
      // Fallback hardcoded preview
      const logoHtml = `<span style="font-size:32px;margin-right:12px;">${f.icon||'⚡'}</span>`;
      
      const extraDetails = [
        `<span>📍 ${dummyContext.business_address}</span>`,
        `<span>📞 ${dummyContext.business_phone}</span>`,
        `<span>🏷️ GST: ${dummyContext.business_gst}</span>`
      ].filter(Boolean).join('<span style="margin:0 6px;opacity:0.5">•</span>');

      const rows = dummyContext.items.map(i =>
        `<tr>
          <td>${i.name}</td>
          <td style="text-align:center">${i.quantity}</td>
          <td style="text-align:right">₹${i.price}</td>
          <td style="text-align:right;font-weight:700;color:${dummyContext.color}">₹${i.total}</td>
        </tr>`
      ).join('');

      html = `<!DOCTYPE html>
<html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:white;padding:24px;color:#1E2235;}
  .card{background:white;border-radius:12px;overflow:hidden;border:1px solid #EEF0FB;}
  .header{background:linear-gradient(135deg,${dummyContext.color},${dummyContext.color2});padding:24px;display:flex;justify-content:space-between;color:white;}
  .body{padding:24px;}
  .bill-to{background:#F8FAFF;padding:12px;border-radius:8px;margin-bottom:20px;}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;}
  th{font-size:10px;text-align:left;color:#A0AEC0;}
  td{padding:8px 0;font-size:12px;border-top:1px solid #F3F5FF;}
  .totals{border-top:2px solid #EEF0FB;padding-top:12px;}
</style></head><body>
<div class="card">
  <div class="header">
    <div style="display:flex;">${logoHtml}<div><h2>${dummyContext.business_name}</h2><div style="font-size:11px">${extraDetails}</div></div></div>
    <div style="text-align:right"><h3>${dummyContext.invoice_no}</h3><div style="font-size:11px">${dummyContext.date}</div></div>
  </div>
  <div class="body">
    <div class="bill-to"><div style="font-size:10px;font-weight:700;color:#A0AEC0">BILL TO</div><h3 style="color:${dummyContext.color}">${dummyContext.customer_name}</h3></div>
    <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="totals"><div style="text-align:right;font-size:16px;font-weight:800;color:${dummyContext.color}">Total: ₹${dummyContext.total_amount}</div></div>
  </div>
</div></body></html>`;
    }

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Preview failed' });
  }
};
