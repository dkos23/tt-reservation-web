const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

router.post('/', async (req, res) => {
  // const { user_id, reservations, text, type } = req.body;
  const { reservations, text, type } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user_id = payload.userId;
  

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const groupRes = await client.query(
      `INSERT INTO reservation_groups (user_id, text, type)
       VALUES ($1, $2, $3) RETURNING group_id`,
      [user_id, text, type]
    );
    const groupId = groupRes.rows[0].group_id;

    for (const r of reservations) {
      const fromDayjs = dayjs(r.from); // accepts ISO string with offset
      const toDayjs = dayjs(r.to);

      await client.query(
        'INSERT INTO reservations (from_time, to_time, court_id, group_id, created) VALUES ($1,$2,$3,$4,NOW())',
        [fromDayjs.toDate(), toDayjs.toDate(), r.courtId, groupId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ groupId });
  } catch (e) {
    console.error("Error in /reservation-group:", e);
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});


router.patch('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { reason, text, reservations } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE reservation_groups SET text = $1 WHERE group_id = $2', [text, groupId]);
    await client.query('DELETE FROM reservations WHERE group_id = $1', [groupId]);
    for (const r of reservations) {
      await client.query(
        'INSERT INTO reservations (from_time, to_time, court_id, group_id, created, text) VALUES ($1,$2,$3,$4,NOW(),$5)',
        [r.from, r.to, r.courtId, groupId, text]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;
