const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { start, end, 'user-id': userId, 'group-id': groupId } = req.query;

  try {
    const values = [];
    let whereClause = [];

    if (start && end) {
      values.push(start);
      values.push(end);
      whereClause.push(`r.to_time > $1 AND r.from_time < $2`);
    }

    if (userId) {
      values.push(userId);
      whereClause.push(`g.user_id = $${values.length}`);
    }

    if (groupId) {
      values.push(groupId);
      whereClause.push(`r.group_id = $${values.length}`);
    }

    const whereSql = whereClause.length ? `WHERE ${whereClause.join(' AND ')}` : '';

    const result = await pool.query(`
      SELECT 
        r.reservation_id,
        r.court_id,
        r.from_time,
        r.to_time,
        r.group_id,
        r.created,
        g.text,
        g.type,
        g.user_id,
        u.name,
        u.admin
      FROM reservations r
      JOIN reservation_groups g USING (group_id)
      LEFT JOIN users u ON g.user_id = u.user_id
      ${whereSql}
      ORDER BY r.from_time ASC
    `, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
