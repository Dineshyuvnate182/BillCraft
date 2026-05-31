const pool = require('./config/db');
const fs = require('fs');

(async () => {
  let out = '';
  const log = (m) => { out += m + '\n'; };
  try {
    const users = await pool.query("SELECT id, name FROM users WHERE role='user' LIMIT 1");
    const userId = users.rows[0]?.id || 1;
    log('User: id=' + userId);

    // Products test
    log('\n=== PRODUCT INSERT TEST ===');
    try {
      const r = await pool.query(
        "INSERT INTO products (user_id, product_name, price, stock, category, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
        [userId, '__TEST__', 100, 10, 'General', 'test']
      );
      log('SUCCESS: id=' + r.rows[0].id);
      await pool.query("DELETE FROM products WHERE id=$1", [r.rows[0].id]);
    } catch(e) {
      log('FAILED: ' + e.message);
    }

    // Purchase test
    log('\n=== PURCHASE FORMAT TEST ===');
    const fmts = await pool.query("SELECT id FROM bill_formats LIMIT 1");
    const fmtId = fmts.rows[0]?.id;
    log('Format id: ' + fmtId);

    // Check purchased_formats constraints
    log('\n=== CONSTRAINTS ===');
    const constr = await pool.query("SELECT conname, contype, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid='purchased_formats'::regclass");
    constr.rows.forEach(c => log(c.conname + ' (' + c.contype + '): ' + c.def));

    try {
      const r = await pool.query(
        "INSERT INTO purchased_formats (user_id, format_id, payment_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, format_id) DO NOTHING RETURNING *",
        [userId, fmtId, 'pay_test_123']
      );
      log('\nPURCHASE SUCCESS: ' + JSON.stringify(r.rows[0] || 'conflict'));
      await pool.query("DELETE FROM purchased_formats WHERE user_id=$1 AND format_id=$2", [userId, fmtId]);
    } catch(e) {
      log('\nPURCHASE FAILED: ' + e.message);
    }

  } catch(e) {
    log('FATAL: ' + e.message);
  } finally {
    fs.writeFileSync('test_output.txt', out);
    console.log(out);
    await pool.end();
  }
})();
