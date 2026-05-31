const express = require('express');
const router  = express.Router();
const auth    = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',    auth.register);
router.post('/login',       auth.login);
router.get('/me',  protect, auth.getMe);
router.put('/me',  protect, auth.updateMe);

// ── One-time admin setup ──────────────────────────────────────────────────────
// Hit POST /api/auth/setup-admin to (re)create admin@billcraft.com / admin123
// Safe to call multiple times. Remove this route once admin is working.
router.post('/setup-admin', auth.setupAdmin);

module.exports = router;
