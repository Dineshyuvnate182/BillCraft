const pool = require('./config/db');
const fs = require('fs');
(async () => {
    try {
        const result = await pool.query(`SELECT template_html FROM bill_formats LIMIT 1`);
        fs.writeFileSync('template_dump.html', result.rows[0].template_html);
        console.log('Saved to template_dump.html');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
