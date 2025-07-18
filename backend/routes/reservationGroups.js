const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

// POST
router.post('/', async (req, res) => {
  // const { user_id, reservations, text, type } = req.body;
  const { reservations, text, type } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user_id = payload.userId;
  const userRes = await pool.query('SELECT admin FROM users WHERE user_id = $1', [user_id]);
  const isAdmin = userRes.rows[0]?.admin;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!isAdmin) {
      // 🔎 Fetch max active limit
      const configRes = await client.query(
        'SELECT reservation_max_active_count FROM config LIMIT 1'
      );
      const maxActive = configRes.rows[0]?.reservation_max_active_count ?? Infinity;
  
      // Count user's current future reservations
      const now = new Date();
      const activeRes = await client.query(`
        SELECT COUNT(*) FROM reservations r
        JOIN reservation_groups g USING (group_id)
        WHERE g.user_id = $1 AND r.from_time > $2
      `, [user_id, now]);
      const currentActive = parseInt(activeRes.rows[0].count, 10);
      const requested = reservations.length;
  
      if (currentActive + requested > maxActive) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          message: 'too many active reservations',
          value: currentActive + requested,
          max: maxActive,
        });
      }
    }

    // console.log("🔧 Creating group with:", { user_id, text, type });
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
        'INSERT INTO reservations (from_time, to_time, court_id, group_id, created, text) VALUES ($1,$2,$3,$4,NOW(),$5)',
        [fromDayjs.toDate(), toDayjs.toDate(), r.courtId, groupId, text]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ groupId });

    // LOG: Immediately after your log, select the record directly:
    // const after = await pool.query('SELECT * FROM reservation_groups');
    // console.log('DB now contains reservation_groups:', after.rows);

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
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user_id = payload.userId;

  const userRes = await pool.query('SELECT admin FROM users WHERE user_id = $1', [user_id]);
  const isAdmin = userRes.rows[0]?.admin;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (!isAdmin) {
      // Fetch max limit
      const configRes = await client.query(
        'SELECT reservation_max_active_count FROM config LIMIT 1'
      );
      const maxActive = configRes.rows[0]?.reservation_max_active_count ?? Infinity;
  
      // Count future reservations excluding this group
      const now = new Date();
      const activeRes = await client.query(`
        SELECT COUNT(*) FROM reservations r
        JOIN reservation_groups g USING (group_id)
        WHERE g.user_id = $1
          AND r.from_time > $2
          AND r.group_id != $3
      `, [user_id, now, groupId]);
      const currentActive = parseInt(activeRes.rows[0].count, 10);
      const requested = reservations.length;
  
      if (currentActive + requested > maxActive) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          message: 'too many active reservations',
          value: currentActive + requested,
          max: maxActive,
        });
      }
    }

    // continue if not admin
    await client.query('UPDATE reservation_groups SET text = $1 WHERE group_id = $2', [text, groupId]);
    await client.query('DELETE FROM reservations WHERE group_id = $1', [groupId]);
    for (const r of reservations) {
      const fromDayjs = dayjs(r.from);
      const toDayjs = dayjs(r.to);

      await client.query(
        'INSERT INTO reservations (from_time, to_time, court_id, group_id, created) VALUES ($1,$2,$3,$4,NOW())',
        [fromDayjs.toDate(), toDayjs.toDate(), r.courtId, groupId]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    console.error("Error during reservation group PATCH::", e);
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;
