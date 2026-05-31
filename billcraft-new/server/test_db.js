const pool = require('./config/db');
(async () => {
    try {
        const result = await pool.query('SELECT * FROM purchased_formats');
        console.log(result.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
