const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------------------------------------------------------------------
// Helper: build CRUD routes for a given geometry table + GeoJSON type
// ---------------------------------------------------------------------
function registerGeometryRoutes(basePath, tableName, geoJsonType) {

  // GET all features as a GeoJSON FeatureCollection
  app.get(`/${basePath}`, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, description, ST_AsGeoJSON(geom) AS geometry FROM ${tableName} ORDER BY id`
      );
      const features = result.rows.map(row => ({
        type: 'Feature',
        geometry: JSON.parse(row.geometry),
        properties: { id: row.id, name: row.name, description: row.description }
      }));
      res.json({ type: 'FeatureCollection', features });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create a new feature (body: { name, description, geometry: GeoJSON geometry })
  app.post(`/${basePath}`, async (req, res) => {
    try {
      const { name, description, geometry } = req.body;
      if (!name || !geometry) return res.status(400).json({ error: 'name and geometry are required' });

      const result = await pool.query(
        `INSERT INTO ${tableName} (name, description, geom)
         VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))
         RETURNING id`,
        [name, description || '', JSON.stringify(geometry)]
      );
      res.status(201).json({ id: result.rows[0].id, message: `${geoJsonType} created` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PUT update an existing feature
  app.put(`/${basePath}/:id`, async (req, res) => {
    try {
      const { name, description, geometry } = req.body;
      const result = await pool.query(
        `UPDATE ${tableName}
         SET name = $1, description = $2, geom = ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)
         WHERE id = $4`,
        [name, description || '', JSON.stringify(geometry), req.params.id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: `${geoJsonType} not found` });
      res.json({ message: `${geoJsonType} updated` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE a feature
  app.delete(`/${basePath}/:id`, async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ error: `${geoJsonType} not found` });
      res.json({ message: `${geoJsonType} deleted` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
}

registerGeometryRoutes('points', 'points', 'Point');
registerGeometryRoutes('lines', 'linestrings', 'LineString');
registerGeometryRoutes('polygons', 'polygons', 'Polygon');

// ---------------------------------------------------------------------
// Optional bonus: spatial analysis endpoints (ST_Intersects, ST_Within, ST_Touches)
// ---------------------------------------------------------------------

// Which polygons contain (ST_Within) a given point id?
app.get('/analysis/point-within-polygons/:pointId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT poly.id, poly.name
       FROM polygons poly, points pt
       WHERE pt.id = $1 AND ST_Within(pt.geom, poly.geom)`,
      [req.params.pointId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Which polygons intersect (ST_Intersects) a given line id?
app.get('/analysis/line-intersects-polygons/:lineId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT poly.id, poly.name
       FROM polygons poly, linestrings line
       WHERE line.id = $1 AND ST_Intersects(line.geom, poly.geom)`,
      [req.params.lineId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Do two polygons touch (ST_Touches)?
app.get('/analysis/polygons-touch/:idA/:idB', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ST_Touches(a.geom, b.geom) AS touches
       FROM polygons a, polygons b
       WHERE a.id = $1 AND b.id = $2`,
      [req.params.idA, req.params.idB]
    );
    res.json({ touches: result.rows[0] ? result.rows[0].touches : null });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`GIS server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
