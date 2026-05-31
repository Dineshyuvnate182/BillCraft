require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/formats',  require('./routes/formatRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/bills',    require('./routes/billRoutes'));
app.use('/api/business', require('./routes/businessRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'OK', time: new Date() }));

// ── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 BillCraft Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'billcraft'}\n`);
});
