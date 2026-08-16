# GIS Project — Project Documentation

**Prepared by:** MOHAMMED G D AHMED
**Date:** [حدث التاريخ]
**GitHub Repository:** [رابط الريبو بعد الرفع]
**Live URL:** [رابط النشر بعد الديبلوي]

---

## 1. Purpose and Scope

This project is a web-based Geographic Information System (GIS) application. It allows a
user to create, view, update, and delete geographic features — Points, LineStrings, and
Polygons — directly on an interactive map, with each feature stored in a spatial database.
It also demonstrates basic spatial analysis using PostGIS functions (ST_Within,
ST_Intersects, ST_Touches) to evaluate relationships between features.

## 2. Technologies and Tools Used

- **Frontend:** Leaflet.js (interactive map), Leaflet.draw (drawing tools), vanilla
  JavaScript, HTML/CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with the PostGIS extension
- **Deployment:** [اسم المنصة، متل Render لكل من backend وقاعدة البيانات]

## 3. Overall Architecture

```
Browser (Leaflet map) ──> Express REST API ──> PostgreSQL + PostGIS
```

The frontend renders an OpenStreetMap basemap via Leaflet. Users draw shapes using
Leaflet.draw; each shape is converted to GeoJSON and sent to the backend, which stores it as
a native PostGIS geometry column. Reading features back converts PostGIS geometry to GeoJSON
via `ST_AsGeoJSON` for the frontend to render.

## 4. Frontend and Backend Structure

**Frontend** (`frontend/`):
- `index.html` — map, drawing tools, layer toggles, feature list with delete buttons

**Backend** (`backend/`):
- `server.js` — REST routes for points/lines/polygons (CRUD) and spatial analysis endpoints
- `db.js` — PostgreSQL connection pool, PostGIS extension setup, table creation

## 5. Database Structure

Three tables, one per geometry type, each with an SRID 4326 (WGS 84) geometry column:

- **points**: id, name, description, geom (GEOMETRY(Point, 4326)), created_at
- **linestrings**: id, name, description, geom (GEOMETRY(LineString, 4326)), created_at
- **polygons**: id, name, description, geom (GEOMETRY(Polygon, 4326)), created_at

## 6. Main Features Developed

- Interactive basemap (OpenStreetMap via Leaflet)
- Draw and save a Point, LineString, or Polygon directly on the map
- Full CRUD: create (draw), read (list + display), delete for all three geometry types
- Layer toggles to show/hide each geometry type
- Feature list panel showing all saved features with delete controls
- Spatial analysis endpoints (bonus): point-within-polygon (ST_Within), line-intersects-
  polygon (ST_Intersects), and polygon-touches-polygon (ST_Touches)

## 7. Technical Considerations and Decisions

- **Separate tables per geometry type** instead of one generic `geometry` column: keeps
  queries simple and typed (`GEOMETRY(Point, 4326)` vs a generic `GEOMETRY`), and matches how
  the assignment separates Point/LineString/Polygon as distinct object types.
- **GeoJSON as the exchange format** between frontend and backend: GeoJSON is what Leaflet
  natively produces and consumes, and PostGIS has built-in functions (`ST_GeomFromGeoJSON`,
  `ST_AsGeoJSON`) to convert directly to/from it, avoiding manual coordinate parsing.
- **SRID 4326 (WGS 84)** was used throughout since it matches standard GPS/web-map
  coordinates and is what Leaflet/OpenStreetMap expect.
- **Leaflet + Leaflet.draw over a heavier mapping framework:** free, lightweight, and
  sufficient for point/line/polygon drawing without a build step.

## 8. Major Problems Encountered and How They Were Solved

- [عبيها بعد ما تجرب المشروع فعلياً وتواجه أي مشكلة حقيقية — مثال: مشكلة بتفعيل PostGIS extension على منصة الاستضافة، أو مشكلة بترتيب الإحداثيات (longitude/latitude) بين Leaflet وGeoJSON]

## 9. Deployment Process and Tools

- **Database:** [Render PostgreSQL / Supabase] with PostGIS extension enabled via
  `CREATE EXTENSION IF NOT EXISTS postgis;`
- **Backend + Frontend:** deployed together as a single Node/Express web service on
  [Render / Railway]
- **Environment variables set:** `DATABASE_URL` (connection string from the database provider)
