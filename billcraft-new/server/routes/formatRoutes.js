const express = require('express');
const router  = express.Router();
const fmt     = require('../controllers/formatController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',               fmt.getAllFormats);
router.get('/purchased',      protect, fmt.getPurchased);
router.get('/:id/preview',    protect, fmt.getPreview);
router.post('/purchase/:id',  protect, fmt.purchaseFormat);
router.post('/',              protect, adminOnly, fmt.createFormat);
router.delete('/:id',         protect, adminOnly, fmt.deleteFormat);

module.exports = router;
