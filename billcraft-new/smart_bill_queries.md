# SmartBill Database Queries

Below is the compilation of all SQL queries executing on the `SmartBill` database, grouped by their respective domains within the application.

## 1. Authentication & Users
**Register a user:**
```sql
SELECT id FROM users WHERE email=$1;
INSERT INTO users (name,email,password,business_name) VALUES($1,$2,$3,$4) RETURNING id,name,email,business_name,role;
```

**Login:**
```sql
SELECT * FROM users WHERE email=$1;
```

**Get / Update Profile:**
```sql
SELECT id,name,email,business_name,role,created_at FROM users WHERE id=$1;

UPDATE users SET name=$1, business_name=$2 WHERE id=$3 RETURNING id,name,email,business_name,role;
```

**Setup Admin:**
```sql
INSERT INTO users (name, email, password, business_name, role)
VALUES ('Admin', 'admin@billcraft.com', $1, 'BillCraft HQ', 'admin')
ON CONFLICT (email) DO UPDATE
SET password = $1, role = 'admin', name = 'Admin';
```

---

## 2. Products
**Fetch Products:**
```sql
SELECT * FROM products WHERE user_id=$1;
-- With search:
SELECT * FROM products WHERE user_id=$1 AND LOWER(product_name) LIKE $2 ORDER BY created_at DESC;
```

**Get Single Product:**
```sql
SELECT * FROM products WHERE id=$1 AND user_id=$2;
```

**Create / Update / Delete Product:**
```sql
INSERT INTO products (user_id, product_name, price, stock, category, description)
VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;

UPDATE products SET product_name=$1, price=$2, stock=$3, category=$4, description=$5
WHERE id=$6 AND user_id=$7 RETURNING *;

DELETE FROM products WHERE id=$1 AND user_id=$2;
```

---

## 3. Bill Formats
**Get Formats:**
```sql
SELECT * FROM bill_formats ORDER BY id;
```

**Get Purchased Formats:**
```sql
SELECT bf.id, bf.name, bf.accent, bf.description, bf.price, bf.icon, bf.tag, bf.color, bf.color2, pf.purchase_date 
FROM bill_formats bf
JOIN purchased_formats pf ON bf.id = pf.format_id
WHERE pf.user_id = $1 ORDER BY pf.purchase_date DESC;
```

**Purchase Format:**
```sql
SELECT * FROM bill_formats WHERE id=$1;

INSERT INTO purchased_formats (user_id, format_id, payment_id)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, format_id) DO NOTHING
RETURNING *;
```

---

## 4. Bills & Items
**Get All Bills:**
```sql
SELECT b.*, bf.name as format_name FROM bills b
LEFT JOIN bill_formats bf ON b.format_id = bf.id
WHERE b.user_id = $1 ORDER BY b.created_at DESC;
```

**Get Single Bill and Items:**
```sql
SELECT b.*, bf.name as format_name, bf.color, bf.icon FROM bills b
LEFT JOIN bill_formats bf ON b.format_id = bf.id
WHERE b.id=$1 AND b.user_id=$2;

SELECT * FROM bill_items WHERE bill_id=$1;
```

**Create Bill:**
```sql
-- Generate Invoice No:
SELECT COUNT(*) FROM bills WHERE user_id=$1;

-- Insert Bill:
INSERT INTO bills (user_id,format_id,customer_name,customer_email,customer_phone,subtotal,gst_amount,total_amount,status,invoice_no,notes)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *;

-- Insert Items:
INSERT INTO bill_items (bill_id,product_id,name,quantity,price,total) VALUES($1,$2,$3,$4,$5,$6);
```

**Update Bill Status / Delete Bill:**
```sql
UPDATE bills SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *;
DELETE FROM bills WHERE id=$1 AND user_id=$2;
```

**Stats & Performance:**
```sql
SELECT COALESCE(SUM(total_amount),0) as total FROM bills WHERE user_id=$1 AND status='Paid';
SELECT COUNT(*) FROM bills WHERE user_id=$1;

SELECT DATE(created_at) as date, SUM(total_amount) as revenue 
FROM bills WHERE user_id=$1 AND status='Paid' 
GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC;

SELECT i.name, SUM(i.quantity) as total_sold
FROM bill_items i JOIN bills b ON i.bill_id = b.id
WHERE b.user_id=$1 AND b.status='Paid'
GROUP BY i.name ORDER BY total_sold DESC LIMIT 5;
```

---

## 5. Admin Dashboard & Analytics
**Overall Stats:**
```sql
SELECT COUNT(*) FROM users WHERE role != 'admin';
SELECT COUNT(*) FROM bill_formats;
SELECT COUNT(*) FROM purchased_formats;
SELECT COALESCE(SUM(bf.price),0) as total FROM purchased_formats pf JOIN bill_formats bf ON pf.format_id=bf.id;
SELECT COUNT(*) FROM bills;

SELECT TO_CHAR(created_at,'Mon') as month, EXTRACT(MONTH FROM created_at) as mon_num, COUNT(*) as sales, COALESCE(SUM(bf.price),0) as revenue
FROM purchased_formats pf JOIN bill_formats bf ON pf.format_id=bf.id
WHERE pf.purchase_date >= NOW() - INTERVAL '6 months'
GROUP BY TO_CHAR(created_at,'Mon'), EXTRACT(MONTH FROM created_at) ORDER BY mon_num;
```

**User Management:**
```sql
SELECT u.id, u.name, u.email, u.role, u.business_name, u.created_at, u.is_blocked,
COUNT(DISTINCT b.id) as bill_count, COUNT(DISTINCT pf.id) as formats_owned
FROM users u LEFT JOIN bills b ON b.user_id = u.id LEFT JOIN purchased_formats pf ON pf.user_id = u.id
WHERE u.role != 'admin' GROUP BY u.id ORDER BY u.created_at DESC;

UPDATE users SET is_blocked = NOT is_blocked WHERE id=$1 RETURNING id,name,email,is_blocked;
DELETE FROM users WHERE id=$1 AND role != $2;
UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role;
UPDATE users SET password=$1 WHERE id=$2;
```

**Format Admin Management:**
```sql
SELECT bf.*, COUNT(DISTINCT pf.id) as sales_count, COALESCE(SUM(bf.price),0) as total_revenue, bf.is_featured, bf.status
FROM bill_formats bf LEFT JOIN purchased_formats pf ON pf.format_id = bf.id
GROUP BY bf.id ORDER BY bf.created_at DESC;

INSERT INTO bill_formats (name,accent,description,price,icon,tag,color,color2,template_html,status)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;

UPDATE bill_formats SET name=$1,accent=$2,description=$3,price=$4,icon=$5,tag=$6,color=$7,color2=$8,template_html=$9,status=$10,is_featured=$11 WHERE id=$12 RETURNING *;

UPDATE bill_formats SET is_featured = NOT is_featured WHERE id=$1 RETURNING *;
UPDATE bill_formats SET status=$1 WHERE id=$2 RETURNING *;
DELETE FROM bill_formats WHERE id=$1;
```

**Analytics:**
```sql
-- Top Formats
SELECT bf.name, bf.accent, bf.icon, bf.color, COUNT(pf.id) as sales
FROM bill_formats bf LEFT JOIN purchased_formats pf ON bf.id=pf.format_id
GROUP BY bf.id ORDER BY sales DESC LIMIT 5;

-- Top Users
SELECT u.name, u.email, COUNT(b.id) as bill_count, COALESCE(SUM(b.total_amount),0) as total_amount
FROM users u LEFT JOIN bills b ON b.user_id=u.id
WHERE u.role != 'admin' GROUP BY u.id ORDER BY bill_count DESC LIMIT 5;

-- Recent Signups
SELECT TO_CHAR(created_at,'DD Mon') as date, COUNT(*) as signups
FROM users WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY TO_CHAR(created_at,'DD Mon'), DATE(created_at) ORDER BY DATE(created_at);

-- Monthly Bills
SELECT TO_CHAR(created_at,'Mon') as month, COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue
FROM bills WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY TO_CHAR(created_at,'Mon'), EXTRACT(MONTH FROM created_at) ORDER BY EXTRACT(MONTH FROM created_at);
```
