const p = require('./config/db');

(async () => {
  try {
    // Test product insert
    const r = await p.query(
      "INSERT INTO products (user_id, product_name, price, stock) VALUES (1, '__VERIFY__', 99, 5) RETURNING id"
    );
    console.log('PRODUCT OK: id=' + r.rows[0].id);
    await p.query('DELETE FROM products WHERE id=$1', [r.rows[0].id]);

    // Test purchase insert
    const f = await p.query('SELECT id FROM bill_formats LIMIT 1');
    const r2 = await p.query(
      'INSERT INTO purchased_formats (user_id, format_id, payment_id) VALUES (1, $1, $2) ON CONFLICT (user_id, format_id) DO NOTHING RETURNING *',
      [f.rows[0].id, 'pay_verify_' + Date.now()]
    );
    console.log('PURCHASE OK: ' + (r2.rows.length ? 'inserted' : 'conflict'));
    await p.query('DELETE FROM purchased_formats WHERE user_id=1 AND format_id=$1', [f.rows[0].id]);

    console.log('ALL VERIFIED OK');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await p.end();
  }
})();
