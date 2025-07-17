const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET all templates
router.get('/', verifyToken /* or public */, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT key, subject, body
    FROM templates
  `);
  res.json(rows);
});

// GET single template
// router.get('/:key', verifyToken, async (req, res) => {
//   const { key } = req.params;
//   const { rows } = await pool.query(`
//     SELECT key, subject, body
//     FROM templates
//     WHERE key = $1
//   `, [key]);
//   if (!rows.length) return res.status(404).json({ message: 'Not found' });
//   res.json(rows[0]);
// });
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT template_id, key, body
      FROM templates;
    `);
    const obj = {};
    rows.forEach(row => {
        if (row.key) {
            obj[row.key] = { body: row.body };
        }
    });
    return res.json(obj);
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT to create/update (admin only)
// router.put('/:key', verifyToken, requireAdmin, async (req, res) => {
//   const { key } = req.params;
//   const { subject, body } = req.body;

//   const { rows } = await pool.query(`
//     INSERT INTO templates (key, subject, body)
//     VALUES ($1, $2, $3)
//     ON CONFLICT (key)
//       DO UPDATE SET subject = EXCLUDED.subject, body = EXCLUDED.body, updated_at = NOW()
//     RETURNING key, subject, body;
//   `, [key, subject, body]);
  
//   res.json(rows[0]);
// });
router.put('/:key', verifyToken, requireAdmin, async (req, res) => {
  const { key } = req.params;
  const { subject, body } = req.body;

  try {
    const { rows } = await pool.query(`
      INSERT INTO templates ("key", subject, body)
      VALUES ($1, $2, $3)
      ON CONFLICT ("key")
        DO UPDATE SET subject = EXCLUDED.subject, body = EXCLUDED.body, updated_at = NOW()
      RETURNING "key", subject, body;
    `, [key, subject, body]);

    res.json(rows[0]);
  } catch (err) {
    console.error('Error saving template:', err);
    res.status(500).json({ message: 'Failed to save template' });
  }
});

module.exports = router;
