const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// ---- Admin credentials (simple, hardcoded for school project) ----
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ---- Very simple in-memory session store ----
const sessions = new Set();

function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach(pair => {
    const [key, ...rest] = pair.trim().split('=');
    cookies[key] = rest.join('=');
  });
  return cookies;
}

function requireAdmin(req, res, next) {
  const cookies = parseCookies(req);
  const token = cookies.session;
  if (token && sessions.has(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'fronted')));

// ---------------- Admin auth ----------------

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateToken();
    sessions.add(token);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; SameSite=Lax`);
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/admin/logout', (req, res) => {
  const cookies = parseCookies(req);
  if (cookies.session) sessions.delete(cookies.session);
  res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
  res.json({ success: true });
});

app.get('/admin/check', (req, res) => {
  const cookies = parseCookies(req);
  const isAdmin = !!(cookies.session && sessions.has(cookies.session));
  res.json({ isAdmin });
});

// ---------------- Products ----------------

app.get('/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id').all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/products', requireAdmin, (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    const insert = db.prepare(
      'INSERT INTO products (name, price, category, description, stock) VALUES (?, ?, ?, ?, ?)'
    );
    const result = insert.run(name, price, category, description, stock || 0);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/products/:id', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Orders ----------------

app.post('/orders', (req, res) => {
  try {
    const { customer_name, delivery_address, items, total } = req.body;
    const insert = db.prepare(
      'INSERT INTO orders (customer_name, delivery_address, items, total) VALUES (?, ?, ?, ?)'
    );
    const result = insert.run(customer_name, delivery_address, JSON.stringify(items), total);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/orders', requireAdmin, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/orders/:id/status', requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});