const pool = require('../config/db');
const Handlebars = require('handlebars');

const nextInvoiceNo = async (userId) => {
  const r = await pool.query('SELECT COUNT(*) FROM bills WHERE user_id=$1', [userId]);
  return `INV-${String(Number(r.rows[0].count) + 1001).padStart(4,'0')}`;
};

// GET /api/bills
exports.getBills = async (req, res) => {
  try {
    const { status } = req.query;
    let q = `SELECT b.*, bf.name as format_name FROM bills b
             LEFT JOIN bill_formats bf ON b.format_id = bf.id
             WHERE b.user_id = $1`;
    const params = [req.user.id];
    if (status && status !== 'All') { q += ' AND b.status=$2'; params.push(status); }
    q += ' ORDER BY b.created_at DESC';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getBills error:', err);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

// GET /api/bills/:id
exports.getBill = async (req, res) => {
  try {
    const bill = await pool.query(
      `SELECT b.*, bf.name as format_name, bf.color, bf.icon FROM bills b
       LEFT JOIN bill_formats bf ON b.format_id = bf.id
       WHERE b.id=$1 AND b.user_id=$2`,
      [req.params.id, req.user.id]
    );
    if (!bill.rows.length) return res.status(404).json({ error: 'Bill not found' });
    const items = await pool.query('SELECT * FROM bill_items WHERE bill_id=$1', [req.params.id]);
    res.json({ ...bill.rows[0], items: items.rows });
  } catch (err) {
    console.error('getBill error:', err);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
};

// POST /api/bills
exports.createBill = async (req, res) => {
  const client = await pool.connect();
  try {
    const { format_id, customer_name, customer_email, customer_phone, items, notes, status } = req.body;
    if (!customer_name || !items?.length)
      return res.status(400).json({ error: 'Customer name and items required' });

    const subtotal    = items.reduce((a, i) => a + i.price * i.quantity, 0);
    const gst_amount  = Math.round(subtotal * 0.18 * 100) / 100;
    const total_amount= Math.round((subtotal + gst_amount) * 100) / 100;
    const invoice_no  = await nextInvoiceNo(req.user.id);

    await client.query('BEGIN');
    const bill = await client.query(
      `INSERT INTO bills (user_id,format_id,customer_name,customer_email,customer_phone,subtotal,gst_amount,total_amount,status,invoice_no,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.id, format_id||null, customer_name, customer_email||'', customer_phone||'', subtotal, gst_amount, total_amount, status||'Draft', invoice_no, notes||'']
    );
    const billId = bill.rows[0].id;

    for (const item of items) {
      await client.query(
        'INSERT INTO bill_items (bill_id,product_id,name,quantity,price,total) VALUES($1,$2,$3,$4,$5,$6)',
        [billId, item.product_id||null, item.name, item.quantity, item.price, item.price * item.quantity]
      );
    }
    await client.query('COMMIT');
    const created = await pool.query('SELECT * FROM bills WHERE id=$1', [billId]);
    const itemsR  = await pool.query('SELECT * FROM bill_items WHERE bill_id=$1', [billId]);
    res.status(201).json({ ...created.rows[0], items: itemsR.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create bill' });
  } finally {
    client.release();
  }
};

// PATCH /api/bills/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE bills SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
      [status, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Bill not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// DELETE /api/bills/:id
exports.deleteBill = async (req, res) => {
  try {
    await pool.query('DELETE FROM bills WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    console.error('deleteBill error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// GET /api/bills/stats
exports.getStats = async (req, res) => {
  try {
    const uid = req.user.id;
    const [revenue, billCount, fmtCount] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(total_amount),0) as total FROM bills WHERE user_id=$1 AND status='Paid'", [uid]),
      pool.query('SELECT COUNT(*) FROM bills WHERE user_id=$1', [uid]),
      pool.query('SELECT COUNT(*) FROM purchased_formats WHERE user_id=$1', [uid]),
    ]);
    res.json({
      revenue:   Number(revenue.rows[0].total),
      billCount: Number(billCount.rows[0].count),
      fmtCount:  Number(fmtCount.rows[0].count),
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Stats failed' });
  }
};

// GET /api/bills/performance
exports.getPerformance = async (req, res) => {
  try {
    const uid = req.user.id;
    
    // Sales over time
    const salesData = await pool.query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as revenue 
       FROM bills 
       WHERE user_id=$1 AND status='Paid' 
       GROUP BY DATE(created_at) 
       ORDER BY DATE(created_at) ASC`,
      [uid]
    );

    // Product demand (top 5 products by quantity sold)
    const demandData = await pool.query(
      `SELECT i.name, SUM(i.quantity) as total_sold
       FROM bill_items i
       JOIN bills b ON i.bill_id = b.id
       WHERE b.user_id=$1 AND b.status='Paid'
       GROUP BY i.name
       ORDER BY total_sold DESC
       LIMIT 5`,
      [uid]
    );

    res.json({
      sales: salesData.rows.map(row => ({
        date: new Date(row.date).toLocaleDateString('en-IN'),
        revenue: Number(row.revenue)
      })),
      demand: demandData.rows.map(row => ({
        name: row.name,
        total_sold: Number(row.total_sold)
      }))
    });
  } catch (err) {
    console.error('getPerformance error:', err);
    res.status(500).json({ error: 'Performance stats failed' });
  }
};

// GET /api/bills/:id/pdf  — returns HTML to print as PDF on client
exports.getBillHTML = async (req, res) => {
  try {
    const bill = await pool.query(
      `SELECT b.*, bf.name as format_name, bf.color, bf.color2, bf.icon, bf.template_html,
              u.name as user_name, u.email as user_email,
              bus.business_name, bus.logo_url, bus.phone as business_phone, bus.email as business_email,
              bus.gst_number as business_gst, bus.address as business_address, bus.website as business_website
       FROM bills b
       LEFT JOIN bill_formats bf ON b.format_id = bf.id
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN businesses bus ON b.user_id = bus.user_id
       WHERE b.id=$1 AND b.user_id=$2`,
      [req.params.id, req.user.id]
    );
    if (!bill.rows.length) return res.status(404).json({ error: 'Bill not found' });
    const items = await pool.query('SELECT * FROM bill_items WHERE bill_id=$1 ORDER BY id', [req.params.id]);
    const b = bill.rows[0];
    const color = b.color || '#6366F1';
    const color2 = b.color2 || '#EC4899';

    const bName = b.business_name || b.user_name || 'BillCraft';
    const bEmail = b.business_email || b.user_email || '';
    
    let absoluteLogoUrl = b.logo_url;
    if (absoluteLogoUrl && absoluteLogoUrl.startsWith('/')) {
      absoluteLogoUrl = `${req.protocol}://${req.get('host')}${absoluteLogoUrl}`;
    }

    const contextItems = items.rows.map(i => ({
      ...i,
      price: Number(i.price).toLocaleString('en-IN'),
      total: Number(i.total).toLocaleString('en-IN')
    }));

    let html = '';

    if (b.template_html) {
      // Use dynamic Handlebars template
      const template = Handlebars.compile(b.template_html);
      
      const context = {
        business_name: bName,
        business_email: bEmail,
        business_phone: b.business_phone,
        business_address: b.business_address,
        business_gst: b.business_gst,
        logo_url: absoluteLogoUrl,
        invoice_no: b.invoice_no,
        date: new Date(b.created_at).toLocaleDateString('en-IN'),
        customer_name: b.customer_name,
        customer_email: b.customer_email,
        items: contextItems,
        subtotal: Number(b.subtotal).toLocaleString('en-IN'),
        gst_amount: Number(b.gst_amount).toLocaleString('en-IN'),
        total_amount: Number(b.total_amount).toLocaleString('en-IN'),
        notes: b.notes,
        color: color,
        color2: color2
      };
      
      html = template(context);
      
      // Inject print script if not present
      if (!html.includes('window.print()')) {
        html = html.replace('</body>', '<script>window.onload=()=>window.print();</script></body>');
      }
    } else {
      // Fallback hardcoded HTML
      const logoHtml = absoluteLogoUrl 
        ? `<img src="${absoluteLogoUrl}" alt="Logo" style="height:48px;border-radius:8px;background:white;padding:4px;object-fit:contain;margin-right:12px;"/>` 
        : `<span style="font-size:32px;margin-right:12px;">${b.icon||'⚡'}</span>`;

      const extraDetails = [
        b.business_address && `<span>📍 ${b.business_address}</span>`,
        b.business_phone && `<span>📞 ${b.business_phone}</span>`,
        b.business_gst && `<span>🏷️ GST: ${b.business_gst}</span>`,
        b.business_website && `<span>🌐 ${b.business_website}</span>`
      ].filter(Boolean).join('<span style="margin:0 6px;opacity:0.5">•</span>');

      const rows = items.rows.map(i =>
        `<tr>
          <td>${i.name}</td>
          <td style="text-align:center">${i.quantity}</td>
          <td style="text-align:right">₹${Number(i.price).toLocaleString('en-IN')}</td>
          <td style="text-align:right;font-weight:700;color:${color}">₹${Number(i.total).toLocaleString('en-IN')}</td>
        </tr>`
      ).join('');

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#F4F6FD;padding:40px;color:#1E2235;}
  .card{background:white;border-radius:16px;max-width:700px;margin:0 auto;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.12);}
  .header{background:linear-gradient(135deg,${color},${color2});padding:28px 32px;display:flex;justify-content:space-between;align-items:center;color:white;}
  .header h1{font-size:24px;font-weight:800;}
  .header .inv{text-align:right;}
  .body{padding:28px 32px;}
  .bill-to{background:#F8FAFF;border-radius:10px;padding:14px 18px;margin-bottom:22px;}
  .bill-to label{font-size:10px;color:#A0AEC0;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;}
  .bill-to h3{font-size:17px;font-weight:800;margin-top:4px;color:${color};}
  table{width:100%;border-collapse:collapse;margin-bottom:22px;}
  th{font-size:10px;color:#C0C8E0;letter-spacing:1.2px;text-transform:uppercase;padding-bottom:10px;text-align:left;font-weight:700;}
  th:not(:first-child){text-align:right;}
  td{padding:10px 0;font-size:13px;border-top:1px solid #F3F5FF;}
  .totals{border-top:2px solid #EEF0FB;padding-top:16px;}
  .total-row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;}
  .total-row span:last-child{font-weight:700;}
  .grand-total{background:linear-gradient(135deg,#EEF0FB,#FDF2F8);border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;margin-top:8px;}
  .grand-total span:first-child{font-weight:800;font-size:15px;}
  .grand-total span:last-child{font-size:26px;font-weight:800;color:${color};}
  .footer{margin-top:24px;text-align:center;font-size:11px;color:#A0AEC0;}
  @media print{body{padding:0;}@page{margin:0;}}
</style></head><body>
<div class="card">
  <div class="header">
    <div style="display:flex;align-items:center;">
      ${logoHtml}
      <div>
        <h1>${bName}</h1>
        ${bEmail ? `<div style="opacity:.85;font-size:12px;margin-top:4px">✉️ ${bEmail}</div>` : ''}
        ${extraDetails ? `<div style="opacity:.85;font-size:11px;margin-top:4px">${extraDetails}</div>` : ''}
      </div>
    </div>
    <div class="inv"><div style="font-size:18px;font-weight:800">${b.invoice_no}</div><div style="opacity:.85;font-size:12px">${new Date(b.created_at).toLocaleDateString('en-IN')}</div></div>
  </div>
  <div class="body">
    <div class="bill-to"><label>Bill To</label><h3>${b.customer_name}</h3>${b.customer_email?`<div style="font-size:12px;color:#64748B;margin-top:2px">${b.customer_email}</div>`:''}</div>
    <table><thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="totals">
      <div class="total-row"><span style="color:#A0AEC0">Subtotal</span><span>₹${Number(b.subtotal).toLocaleString('en-IN')}</span></div>
      <div class="total-row"><span style="color:#A0AEC0">GST (18%)</span><span style="color:#059669">₹${Number(b.gst_amount).toLocaleString('en-IN')}</span></div>
      <div class="grand-total"><span>Total Amount</span><span>₹${Number(b.total_amount).toLocaleString('en-IN')}</span></div>
    </div>
    ${b.notes?`<div style="margin-top:18px;font-size:12px;color:#64748B"><strong>Notes:</strong> ${b.notes}</div>`:''}
    <div class="footer">Thank you for your business · Generated by BillCraft Pro Suite</div>
  </div>
</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
    }

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
};
