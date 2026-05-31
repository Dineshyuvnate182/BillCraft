const jwt = require('jsonwebtoken');

(async () => {
    try {
        const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'billcraft_secret');

        const r1 = await fetch('http://localhost:5000/api/formats/purchased', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const d1 = await r1.json();
        console.log('GET /formats/purchased:', r1.status, JSON.stringify(d1, null, 2));

        const r2 = await fetch('http://localhost:5000/api/business', {
             headers: { Authorization: `Bearer ${token}` }
        });
        const d2 = await r2.json();
        console.log('GET /business:', r2.status, JSON.stringify(d2, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
})();
