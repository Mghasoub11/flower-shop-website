# Flower Shop — Project Documentation

## 1. Project Purpose & Scope

This project is a simple e-commerce web application for a flower shop. It allows customers to browse available flower products, add them to a shopping cart, and place an order with their name and delivery address. On the operations side, staff can manage the product catalog (add/update/delete products), track stock levels to prevent overselling, update order status (pending → processing → delivered), and look up past orders through a dedicated admin panel.

## 2. Technologies & Tools Used

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (via `better-sqlite3`) |
| Version Control | Git & GitHub |
| Deployment | Render (free tier) |

SQLite was chosen over a cloud database (originally Firebase was considered) because it is free, lightweight, and requires no external account or billing setup — suitable for the scope of a school project with a single small dataset.

## 3. Overall Architecture

The application follows a simple client-server architecture:

- The **frontend** (static HTML/CSS/JS in the `fronted` folder) is served directly by the Express server.
- The **backend** (`backend/server.js`) exposes a REST API for products, orders, and admin authentication.
- The **database** (`backend/flowershop.db`) stores products and orders in two tables, initialized automatically on first run.

```
Browser  <-->  Express server (server.js)  <-->  SQLite database (flowershop.db)
```

## 4. Frontend Structure

- `index.html` / `script.js` / `style.css` — customer-facing storefront: browsing products and placing orders.
- `admin.html` — admin panel: login form, products table with add/delete, orders table with status updates.

The admin panel communicates with the backend using `fetch()` calls with `credentials: 'include'` so that session cookies are sent with each request.

## 5. Backend Structure

`backend/server.js` sets up an Express app with the following responsibilities:

- Serves static frontend files.
- Handles admin authentication using a simple in-memory session token stored in an HTTP-only cookie.
- Exposes REST endpoints for products and orders (see table below).

### API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/admin/login` | Public | Authenticates admin, sets session cookie |
| POST | `/admin/logout` | Public | Clears session cookie |
| GET | `/admin/check` | Public | Checks if a valid admin session exists |
| GET | `/products` | Public | Lists all products |
| POST | `/products` | Admin only | Adds a new product |
| DELETE | `/products/:id` | Admin only | Deletes a product |
| POST | `/orders` | Public | Places a new order |
| GET | `/orders` | Admin only | Lists all orders |
| PATCH | `/orders/:id/status` | Admin only | Updates an order's status |

## 6. Database Structure

**products**

| Column | Type |
|---|---|
| id | INTEGER PRIMARY KEY |
| name | TEXT |
| price | REAL |
| category | TEXT |
| description | TEXT |
| stock | INTEGER |

**orders**

| Column | Type |
|---|---|
| id | INTEGER PRIMARY KEY |
| customer_name | TEXT |
| delivery_address | TEXT |
| items | TEXT (JSON) |
| total | REAL |
| status | TEXT (pending / processing / delivered) |
| created_at | TEXT (timestamp) |

## 7. Main Features

- Public product listing.
- Order placement with customer name, delivery address, and item list.
- Admin login/logout with session-based authentication.
- Admin dashboard: view products, add products, delete products.
- Admin order management: view all orders, update order status.
- Stock tracking to avoid overselling.

## 8. Technical Considerations & Decisions

- **Simple session auth**: Instead of a full user/roles system, a single hardcoded admin account with an in-memory session token was used, appropriate for the scope of this project.
- **Environment-based port**: The server reads `process.env.PORT` (falling back to a default) so it works both locally and on Render, which assigns its own port dynamically.
- **Static file serving**: Express serves the frontend directly, so the whole app (frontend + backend) is deployed as a single service.

## 9. Problems Encountered & Solutions

During development, a Git merge between two separate project repositories (this Flower Shop project and a second, unrelated GIS project from the same course) was resolved incorrectly, which caused the GIS project's backend code to overwrite `server.js` in this repository. This was discovered when the deployed site failed to behave like a flower shop backend.

**Resolution:** The correct frontend (`admin.html`, `index.html`, `script.js`, `style.css`) and database file (`db.js`) were confirmed to be intact from earlier commits and file inspection. `server.js` was then rewritten from scratch to match the existing frontend's expected API contract (endpoints, request/response shapes), restoring full functionality including the admin login, product management, and order management features. The corrected code was tested locally before being committed and pushed to GitHub.

## 10. Deployment Process

1. Ensured `package.json` contains a `start` script (`node server.js`) and the server reads the port from `process.env.PORT`.
2. Created a new Web Service on [Render](https://render.com), connected to the GitHub repository.
3. Configured Build Command: `npm install`, Start Command: `npm start`, on Render's free tier.
4. Render automatically builds and deploys on every push to the `main` branch.

**Live URL:** https://flower-shop-website-xmej.onrender.com
**Admin Panel:** https://flower-shop-website-xmej.onrender.com/admin.html
