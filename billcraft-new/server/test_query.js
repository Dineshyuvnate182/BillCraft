const pool = require('./config/db');
(async () => {
    try {
        const result = await pool.query(`
            SELECT bf.id, bf.name, bf.accent, bf.description, bf.price, bf.icon, bf.tag, bf.color, bf.color2, pf.purchase_date 
            FROM bill_formats bf
            JOIN purchased_formats pf ON bf.id = pf.format_id
            WHERE pf.user_id = $1 ORDER BY pf.purchase_date DESC
        `, [1]);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
