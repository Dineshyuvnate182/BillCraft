const express = require('express');
const router  = express.Router();
const bill    = require('../controllers/billController');
const { protect } = require('../middleware/auth');

router.get('/stats',        protect, bill.getStats);
router.get('/performance',  protect, bill.getPerformance);
router.get('/',             protect, bill.getBills);
router.get('/:id',          protect, bill.getBill);
router.get('/:id/pdf',      protect, bill.getBillHTML);
router.post('/',            protect, bill.createBill);
router.patch('/:id/status', protect, bill.updateStatus);
router.delete('/:id',       protect, bill.deleteBill);

module.exports = router;
