const express = require('express');
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/config
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  //LOG:
  console.log('🔧 config PATCH payload:', req.body);

  const result = await pool.query('SELECT * FROM config LIMIT 1');
  res.json(result.rows[0]);
});

// PATCH /api/config
router.patch('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const allowedFields = [
      'announcement', 'visible_hours', 'org_name', 'server_mail',
      'url', 'reservation_days_in_advance', 'reservation_max_active_count', 'time_zone'
    ];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowedFields) {
      if (key in req.body) {
        updates.push(`${key} = $${idx++}`);
        values.push(req.body[key]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ message: 'No valid fields to update' });

    const q = `
      UPDATE config SET ${updates.join(', ')} WHERE id = 1 RETURNING *;
    `;
    const result = await pool.query(q, values);
    res.json(result.rows[0]);
  
    // LOG: Immediately after your log, select the record directly:
    // const after = await pool.query('SELECT * FROM config WHERE id = 1');
    // console.log('DB now contains config:', after.rows[0]);
  } catch (error) {
    console.error("config route error:", error);
  }
});

module.exports = router;
