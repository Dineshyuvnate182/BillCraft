const pool = require('./config/db');
const fs = require('fs');
(async () => {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'purchased_formats';
        `);
        fs.writeFileSync('schema_out.json', JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
