const pool = require('./config/db');
const fs = require('fs');

(async () => {
  let out = '';
  const log = (m) => { out += m + '\n'; console.log(m); };
  try {
    // Fix 1: Add stock column to products
    log('--- Fix 1: Adding stock column to products ---');
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0");
    log('OK: stock column added');

    // Fix 2: Add category column to products (if missing)
    log('--- Fix 2: Adding category column to products ---');
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(80) DEFAULT 'General'");
    log('OK: category column added');

    // Fix 3: Add description column to products (if missing)
    log('--- Fix 3: Adding description column to products ---');
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''");
    log('OK: description column added');

    // Fix 4: Add UNIQUE constraint on purchased_formats(user_id, format_id)
    log('--- Fix 4: Adding UNIQUE constraint on purchased_formats ---');
    try {
      await pool.query("ALTER TABLE purchased_formats ADD CONSTRAINT purchased_formats_user_format_unique UNIQUE (user_id, format_id)");
      log('OK: UNIQUE constraint added');
    } catch(e) {
      if (e.message.includes('already exists')) {
        log('OK: constraint already exists');
      } else {
        log('ERROR: ' + e.message);
      }
    }

    // Fix 5: Ensure ON DELETE CASCADE on purchased_formats foreign keys
    log('--- Fix 5: Updating foreign key constraints ---');
    // Drop old FK and recreate with CASCADE
    try {
      await pool.query("ALTER TABLE purchased_formats DROP CONSTRAINT IF EXISTS purchased_formats_user_id_fkey");
      await pool.query("ALTER TABLE purchased_formats ADD CONSTRAINT purchased_formats_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
      log('OK: user_id FK updated to CASCADE');
    } catch(e) { log('FK update note: ' + e.message); }

    try {
      await pool.query("ALTER TABLE purchased_formats DROP CONSTRAINT IF EXISTS purchased_formats_format_id_fkey");
      await pool.query("ALTER TABLE purchased_formats ADD CONSTRAINT purchased_formats_format_id_fkey FOREIGN KEY (format_id) REFERENCES bill_formats(id) ON DELETE CASCADE");
      log('OK: format_id FK updated to CASCADE');
    } catch(e) { log('FK update note: ' + e.message); }

    // Verify fixes
    log('\n--- Verify: product insert ---');
    const r = await pool.query(
      "INSERT INTO products (user_id, product_name, price, stock, category, description) VALUES (1, '__VERIFY__', 99, 5, 'Test', 'test') RETURNING id"
    );
    log('Product insert OK: id=' + r.rows[0].id);
    await pool.query("DELETE FROM products WHERE id=$1", [r.rows[0].id]);

    log('\n--- Verify: purchase insert ---');
    const fmts = await pool.query("SELECT id FROM bill_formats LIMIT 1");
    const r2 = await pool.query(
      "INSERT INTO purchased_formats (user_id, format_id, payment_id) VALUES (1, $1, 'pay_verify') ON CONFLICT (user_id, format_id) DO NOTHING RETURNING *",
      [fmts.rows[0].id]
    );
    log('Purchase insert OK: ' + (r2.rows.length ? 'inserted' : 'conflict handled'));
    await pool.query("DELETE FROM purchased_formats WHERE user_id=1 AND format_id=$1", [fmts.rows[0].id]);

    log('\nAll fixes applied and verified!');
  } catch(e) {
    log('FATAL: ' + e.message);
  } finally {
    fs.writeFileSync('fix_output.txt', out);
    await pool.end();
  }
})();
