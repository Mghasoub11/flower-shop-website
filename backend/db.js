const Database = require('better-sqlite3');
const db = new Database('flowershop.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    description TEXT,
    stock INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed some starter products if the table is empty
const count = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, category, description, stock) VALUES (?, ?, ?, ?, ?)');
  insert.run('Rose Bouquet', 25, 'Bouquets', 'A dozen red roses, hand-tied', 10);
  insert.run('Tulip Basket', 20, 'Baskets', 'Colorful spring tulips in a basket', 8);
  insert.run('Sunflower Bunch', 18, 'Bouquets', 'Bright sunflowers, perfect for any occasion', 12);
  insert.run('Orchid Plant', 35, 'Plants', 'Elegant potted orchid', 5);
}

module.exports = db;
