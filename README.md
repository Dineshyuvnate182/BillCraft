# ⚡ BillCraft Pro Suite

> A full-stack React + Node.js SaaS billing platform with smart bill generation, format marketplace, and PDF export.

---

## 📁 Project Structure

```
billcraft/
├── server/                    ← Node.js + Express Backend
│   ├── config/
│   │   ├── db.js              ← PostgreSQL connection
│   │   └── schema.sql         ← Database schema & seed data
│   ├── controllers/
│   │   ├── authController.js  ← Register, Login, Profile
│   │   ├── billController.js  ← CRUD + PDF generation
│   │   ├── formatController.js← Bill formats & purchases
│   │   └── productController.js← Product management
│   ├── middleware/
│   │   └── auth.js            ← JWT protect + admin guard
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── billRoutes.js
│   │   ├── formatRoutes.js
│   │   └── productRoutes.js
│   ├── .env.example           ← Copy to .env and fill values
│   ├── package.json
│   └── index.js               ← Express app entry point
│
├── client/                    ← React 18 Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── UI.js          ← Design system (tokens, components)
│   │   │   ├── Sidebar.js     ← Navigation sidebar
│   │   │   └── Topbar.js      ← Header bar
│   │   ├── context/
│   │   │   └── AuthContext.js ← Auth state (login/register/logout)
│   │   ├── pages/
│   │   │   ├── AuthPages.js   ← Login + Register
│   │   │   ├── Dashboard.js   ← Stats + recent bills
│   │   │   ├── FormatPages.js ← Store + My Formats
│   │   │   ├── ProductsPage.js← Product CRUD
│   │   │   ├── CreateBillPage.js← Smart bill generator
│   │   │   └── HistoryPage.js ← Bill history + filters
│   │   ├── utils/
│   │   │   └── api.js         ← Axios instance with JWT
│   │   ├── App.js             ← Main app + routing
│   │   └── index.js           ← React entry point
│   └── package.json
│
└── package.json               ← Root scripts (run both together)
```

---

## 🚀 Quick Setup

### 1. Clone / Extract the folder
```bash
cd billcraft-new
```

### 2. Setup PostgreSQL Database
```sql
-- In psql or pgAdmin:
CREATE DATABASE billcraft;
\c billcraft
\i server/config/schema.sql
```

### 3. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your DB credentials
```

### 4. Install Dependencies
```bash
# Install all (root + server + client)
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 5. Run Development (Both servers)
```bash
npm run dev
# Backend:  http://localhost:5000
# Frontend: http://localhost:3000
```

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update profile |

### Formats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/formats` | All bill formats |
| GET | `/api/formats/purchased` | User's purchased formats |
| POST | `/api/formats/purchase/:id` | Purchase a format |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products?search=` | Get user products |
| POST | `/api/products` | Add product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | All bills (filter by status) |
| POST | `/api/bills` | Create new bill |
| GET | `/api/bills/stats` | Dashboard stats |
| GET | `/api/bills/:id` | Single bill with items |
| GET | `/api/bills/:id/pdf` | HTML bill for print/PDF |
| PATCH | `/api/bills/:id/status` | Update bill status |
| DELETE | `/api/bills/:id` | Delete bill |

---

## 🎨 Design System

**Colors:**
- Primary: `#6366F1` (Indigo)
- Accent: `#EC4899` (Pink)  
- Success: `#059669` (Green)
- Warning: `#D97706` (Amber)
- Error: `#F43F5E` (Red)

**Fonts:**
- Display: `Bricolage Grotesque 800`
- Body: `DM Sans 400/500/600`

**React Hooks Used:**
- `useState` — page routing, form state, data lists
- `useEffect` — API fetching, animated counter
- `useCallback` — search handler, buy handler
- `useMemo` — bill total calculations

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Axios |
| Styling | Inline CSS + CSS Animations |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| PDF | Print-to-PDF via HTML template |
| Payments | Ready for Razorpay integration |

---

## 📝 Default Admin Login
```
Email:    admin@billcraft.com
Password: password
```

---

## ✨ Features

- ✅ User Registration & Login (JWT)
- ✅ Bill Format Marketplace (buy formats)
- ✅ Smart Product Search (keyword auto-complete)
- ✅ Bill Generator with GST calculation
- ✅ Print/PDF Bill generation
- ✅ Bill History with status filters
- ✅ Product CRUD with stock tracking
- ✅ Animated dashboard stats
- ✅ Span color combinations throughout UI
- ✅ Light theme with Indigo + Pink brand

---

Made with ⚡ by Dinesh Kumar · BillCraft Pro Suite 2026
