const express = require('express');
const pool = require('../db');
// const { requireAdmin } = require('../authMiddleware');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/courts – fetch list of courts
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT court_id AS "courtId", name FROM courts ORDER BY court_id');
  res.json(rows);
});

// PUT /api/courts – replace full court list (admin-only)
router.put('/', verifyToken, requireAdmin, async (req, res) => {
  const courts = req.body; // expect [{ courtId, name }, ...]

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE courts RESTART IDENTITY');
    const insertText = 'INSERT INTO courts (court_id, name) VALUES ($1, $2)';
    for (const c of courts) {
      await client.query(insertText, [c.courtId, c.name]);
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating courts:', err);
    res.status(500).json({ message: 'Updating courts failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
