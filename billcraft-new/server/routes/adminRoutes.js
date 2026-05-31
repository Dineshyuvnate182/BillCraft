const express = require('express');
const router  = express.Router();
const admin   = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/stats',          admin.getDashboardStats);
router.get('/analytics',      admin.getAnalytics);

// Users
router.get('/users',          admin.getAllUsers);
router.patch('/users/:id/block',  admin.toggleUserBlock);
router.patch('/users/:id/role',   admin.changeUserRole);
router.post('/users/:id/reset-password', admin.resetUserPassword);
router.delete('/users/:id',   admin.deleteUser);

// Formats
router.get('/formats',        admin.getAllFormatsAdmin);
router.post('/formats',       admin.createFormatAdmin);
router.put('/formats/:id',    admin.updateFormat);
router.patch('/formats/:id/featured', admin.toggleFeatured);
router.patch('/formats/:id/status',   admin.toggleFormatStatus);
router.delete('/formats/:id', admin.deleteFormatAdmin);

// Payments
router.get('/payments',       admin.getAllPayments);

// Bills
router.get('/bills',          admin.getAllBills);

// Products
router.get('/products',       admin.getAllProducts);
router.delete('/products/:id', admin.deleteProductAdmin);

module.exports = router;
