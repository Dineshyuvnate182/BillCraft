const pool = require('./config/db');
(async () => {
    try {
        const result = await pool.query(`SELECT id, name, template_html FROM bill_formats`);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
