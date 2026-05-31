const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const biz     = require('../controllers/businessController');
const { protect } = require('../middleware/auth');

// Multer config for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'logos');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo_${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

router.get('/',      protect, biz.getProfile);
router.put('/',      protect, biz.upsertProfile);
router.put('/default-format', protect, biz.setDefaultFormat);
router.post('/logo', protect, upload.single('logo'), biz.uploadLogo);

module.exports = router;
