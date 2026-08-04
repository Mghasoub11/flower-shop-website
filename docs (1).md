# Flower Shop — Project Documentation

**Prepared by:** MOHAMMED G D AHMED
**Date:** August 4, 2026
**Repository:** https://github.com/Mghasoub11/flower-shop-website.git

---

## 1. Project Objective and Scope

This project is a simple e-commerce web application for a flower shop. It allows
customers to browse available flower products, add them to a shopping cart, and
place an order with their name and delivery address. On the operations side, staff
can manage the product catalog (add/update/delete products), track stock levels to
prevent overselling, update order status (pending → processing → delivered), and
look up past orders.

The scope covers:
- Customer-facing flow: browse products → add to cart → checkout
- Staff-facing flow: manage products, view/update order status, look up orders
- Data persistence for both products and orders (no data lost on server restart)

Out of scope for this version: user authentication/login, payment processing, and
admin UI (staff operations are exposed as API endpoints rather than a dashboard).

## 2. Frontend Technologies

- **HTML5 / CSS3** for structure and styling
- **Vanilla JavaScript (fetch API)** for communicating with the backend

These were chosen for simplicity and to keep the project dependency-free — no build
step, no framework overhead — which fits the scale of a single small shop with a
handful of pages (product list, cart, checkout confirmation).

## 3. Backend Technologies

- **Node.js** as the runtime
- **Express.js** as the web framework, handling routing for products, cart, and
  orders (`GET/POST/PUT/DELETE /products`, `POST /cart/add`, `GET /cart`,
  `DELETE /cart/:index`, `POST /checkout`, `GET /orders`, `PATCH /orders/:id/status`)

Express was chosen because it's lightweight, has a huge ecosystem, and is
straightforward to learn — ideal for a project this size where a heavier framework
(NestJS, etc.) would be overkill.

## 4. Database Technology

- **SQLite**, accessed via the **better-sqlite3** npm package

Two tables: `products` (id, name, price, category, description, stock) and `orders`
(id, customer_name, delivery_address, items, total, status, created_at).

## 5. Why These Technologies

- **SQLite/better-sqlite3** instead of a cloud database like Firebase: it's fully
  open-source, requires no external account or internet dependency to run, and still
  gives real SQL (joins, constraints, transactions) rather than a NoSQL document
  store. For a project of this size, a single-file embedded database is simpler to
  set up, test, and grade than provisioning a cloud service — while still being a
  production-grade choice for small applications.
- **Express.js**: minimal boilerplate, well-documented, and directly matches what's
  being taught in the course, so it's easy to explain each route's purpose.
- **Vanilla JS frontend**: avoids adding a framework's learning curve/build tooling
  when the UI itself is simple (a handful of views), keeping the whole stack easy to
  reason about end-to-end.

---

## Current System vs. Real-World Requirements

**What the base system does:**
- Customers can view products and their prices
- Customers can add items to a cart and view it
- Customers can check out, which saves the order

**Gaps identified and addressed:**

| Gap | Why it matters | How it's solved |
|---|---|---|
| No inventory tracking | A product could be "sold" more times than exist in stock | `stock` column on products; checkout validates and decrements stock, rejecting orders that exceed available stock |
| No order status | Staff can't tell what's pending vs. delivered | `status` column on orders (`pending`/`processing`/`delivered`), updatable via `PATCH /orders/:id/status` |
| No way to manage products without editing code | Shop owner isn't a developer | Full CRUD on products: `POST/PUT/DELETE /products/:id` |
| No way to look up past orders | Customer service needs order history | `GET /orders` (staff, all orders) and `GET /orders/:id` (lookup by id) |
