const express = require('express');
const router  = express.Router();
const prod    = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/',      protect, prod.getProducts);
router.get('/:id',   protect, prod.getProduct);
router.post('/',     protect, prod.createProduct);
router.put('/:id',   protect, prod.updateProduct);
router.delete('/:id',protect, prod.deleteProduct);

module.exports = router;
