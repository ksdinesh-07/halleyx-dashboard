const express        = require('express');
const cors           = require('cors');
const { v4: uuidv4 } = require('uuid');
const Database       = require('better-sqlite3');
const path           = require('path');
const fs             = require('fs');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// ── Database setup ────────────────────────────────────────────────────────────

const DB_DIR  = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'halleyx.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create tables ─────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id            TEXT PRIMARY KEY,
    customerId    TEXT NOT NULL,
    customerName  TEXT,
    firstName     TEXT,
    lastName      TEXT,
    email         TEXT,
    phone         TEXT,
    streetAddress TEXT,
    city          TEXT,
    state         TEXT,
    postalCode    TEXT,
    country       TEXT,
    product       TEXT,
    quantity      INTEGER DEFAULT 1,
    unitPrice     REAL    DEFAULT 0,
    totalAmount   REAL    DEFAULT 0,
    status        TEXT    DEFAULT 'Pending',
    createdBy     TEXT,
    createdAt     TEXT    NOT NULL,
    updatedAt     TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dashboards (
    userId    TEXT PRIMARY KEY,
    widgets   TEXT NOT NULL DEFAULT '[]',
    updatedAt TEXT NOT NULL
  );
`);

// ── Helpers ───────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(4, '0');

function rowToOrder(row) {
  if (!row) return null;
  return {
    id:            row.id,
    customerId:    row.customerId,
    customerName:  row.customerName,
    firstName:     row.firstName,
    lastName:      row.lastName,
    email:         row.email,
    phone:         row.phone,
    streetAddress: row.streetAddress,
    city:          row.city,
    state:         row.state,
    postalCode:    row.postalCode,
    country:       row.country,
    product:       row.product,
    quantity:      row.quantity,
    unitPrice:     row.unitPrice,
    totalAmount:   row.totalAmount,
    status:        row.status,
    createdBy:     row.createdBy,
    createdAt:     row.createdAt,
    updatedAt:     row.updatedAt,
  };
}

// ── Orders API ────────────────────────────────────────────────────────────────

app.get('/api/orders', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM orders ORDER BY createdAt ASC').all();
    res.json(rows.map(rowToOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Order not found' });
    res.json(rowToOrder(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read order' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as cnt FROM orders').get().cnt;
    const seq   = count + 1;
    const now   = new Date().toISOString();

    const { id: _id, customerId: _cid, createdAt: _ca, updatedAt: _ua, ...body } = req.body;

    const newOrder = {
      ...body,
      id:          'ORD-'  + pad(seq),
      customerId:  'CUST-' + pad(seq),
      quantity:    parseInt(body.quantity)    || 1,
      unitPrice:   parseFloat(body.unitPrice) || 0,
      totalAmount: (parseInt(body.quantity) || 1) * (parseFloat(body.unitPrice) || 0),
      createdAt:   now,
      updatedAt:   now,
    };

    db.prepare(`
      INSERT INTO orders (
        id, customerId, customerName, firstName, lastName,
        email, phone, streetAddress, city, state, postalCode, country,
        product, quantity, unitPrice, totalAmount,
        status, createdBy, createdAt, updatedAt
      ) VALUES (
        @id, @customerId, @customerName, @firstName, @lastName,
        @email, @phone, @streetAddress, @city, @state, @postalCode, @country,
        @product, @quantity, @unitPrice, @totalAmount,
        @status, @createdBy, @createdAt, @updatedAt
      )
    `).run(newOrder);

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    const updated = {
      ...rowToOrder(existing),
      ...req.body,
      id:         existing.id,
      customerId: existing.customerId,
      createdAt:  existing.createdAt,
      updatedAt:  new Date().toISOString(),
    };

    updated.quantity    = parseInt(updated.quantity)    || 1;
    updated.unitPrice   = parseFloat(updated.unitPrice) || 0;
    updated.totalAmount = updated.quantity * updated.unitPrice;

    db.prepare(`
      UPDATE orders SET
        customerName  = @customerName,
        firstName     = @firstName,
        lastName      = @lastName,
        email         = @email,
        phone         = @phone,
        streetAddress = @streetAddress,
        city          = @city,
        state         = @state,
        postalCode    = @postalCode,
        country       = @country,
        product       = @product,
        quantity      = @quantity,
        unitPrice     = @unitPrice,
        totalAmount   = @totalAmount,
        status        = @status,
        createdBy     = @createdBy,
        updatedAt     = @updatedAt
      WHERE id = @id
    `).run(updated);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// ── Dashboard API ─────────────────────────────────────────────────────────────

app.get('/api/dashboard/:userId', (req, res) => {
  try {
    const row = db.prepare('SELECT widgets FROM dashboards WHERE userId = ?').get(req.params.userId);
    res.json({ widgets: row ? JSON.parse(row.widgets) : [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read dashboard' });
  }
});

app.post('/api/dashboard/:userId', (req, res) => {
  try {
    const widgets = JSON.stringify(req.body.widgets || []);
    const now     = new Date().toISOString();
    db.prepare(`
      INSERT INTO dashboards (userId, widgets, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        widgets   = excluded.widgets,
        updatedAt = excluded.updatedAt
    `).run(req.params.userId, widgets, now);
    res.json({ message: 'Dashboard saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save dashboard' });
  }
});

// ── Session API ───────────────────────────────────────────────────────────────

app.post('/api/session', (req, res) => {
  const userId = req.body.userId || uuidv4();
  res.json({ userId });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
