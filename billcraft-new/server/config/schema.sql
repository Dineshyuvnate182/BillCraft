-- BillCraft Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  business_name VARCHAR(150),
  role          VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin','user','agent')),
  is_blocked    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Bill Formats
CREATE TABLE IF NOT EXISTS bill_formats (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  accent         VARCHAR(100),
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  template_html  TEXT,
  icon           VARCHAR(10) DEFAULT '🧾',
  tag            VARCHAR(30) DEFAULT 'Standard',
  color          VARCHAR(10) DEFAULT '#6366F1',
  color2         VARCHAR(10) DEFAULT '#818CF8',
  is_featured    BOOLEAN DEFAULT FALSE,
  status         VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','pending')),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Purchased Formats
CREATE TABLE IF NOT EXISTS purchased_formats (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  format_id     INT NOT NULL REFERENCES bill_formats(id),
  payment_id    VARCHAR(100),
  purchase_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, format_id)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(150) NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  stock        INT DEFAULT 0,
  category     VARCHAR(80) DEFAULT 'General',
  description  TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  format_id     INT REFERENCES bill_formats(id),
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(150),
  customer_phone VARCHAR(20),
  subtotal      DECIMAL(12,2) DEFAULT 0,
  gst_amount    DECIMAL(12,2) DEFAULT 0,
  total_amount  DECIMAL(12,2) NOT NULL,
  status        VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft','Paid','Pending')),
  invoice_no    VARCHAR(50) UNIQUE,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Bill Items
CREATE TABLE IF NOT EXISTS bill_items (
  id         SERIAL PRIMARY KEY,
  bill_id    INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  name       VARCHAR(150) NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  price      DECIMAL(10,2) NOT NULL,
  total      DECIMAL(12,2) NOT NULL
);

-- Businesses Profile
CREATE TABLE IF NOT EXISTS businesses (
  id                SERIAL PRIMARY KEY,
  user_id           INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name     VARCHAR(150),
  gst_number        VARCHAR(50),
  address           TEXT,
  phone             VARCHAR(20),
  email             VARCHAR(150),
  website           VARCHAR(150),
  logo_url          TEXT,
  default_format_id INT REFERENCES bill_formats(id) ON DELETE SET NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);

-- Seed: Bill Formats
INSERT INTO bill_formats (name, accent, description, price, icon, tag, color, color2) VALUES
  ('Retail',     'Shop',    'Perfect for retail & general stores with GST support', 99,  '🛍️', 'Popular', '#6366F1', '#818CF8'),
  ('Medical',    'Store',   'Medical billing with medicine names and dosage fields', 149, '💊', 'Premium', '#0EA5E9', '#38BDF8'),
  ('Restaurant', 'Bill',    'Restaurant & cafe billing with table numbers',           129, '🍽️', 'Hot',     '#F43F5E', '#FB7185'),
  ('GST',        'Invoice', 'Full GST-compliant invoice with CGST/SGST breakup',     199, '📋', 'New',     '#8B5CF6', '#A78BFA'),
  ('Simple',     'Invoice', 'Clean minimal invoice for freelancers & services',       79,  '🧾', 'Basic',   '#10B981', '#34D399')
ON CONFLICT DO NOTHING;

-- Seed: Admin user (password: admin123)
-- Hash below is bcrypt(admin123, 10)
INSERT INTO users (name, email, password, business_name, role) VALUES
  ('Admin', 'admin@billcraft.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'BillCraft HQ', 'admin')
ON CONFLICT (email) DO UPDATE
  SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      role     = 'admin';
