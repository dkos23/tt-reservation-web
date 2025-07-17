// const express = require('express');
// const bcrypt = require('bcrypt');
// const pool = require('../db');
// const { verifyToken } = require('../middleware/auth'); // your JWT middleware

// const router = express.Router();

// // PATCH /api/user/:userId
// router.patch('/:userId', verifyToken, async (req, res) => {
//   const { userId } = req.params;
//   const { name, mail, password } = req.body;
  
//   if (parseInt(userId, 10) !== req.user.userId) {
//     return res.status(403).json({ message: 'Not allowed' });
//   }

//   try {
//     const updates = [];
//     const params = [userId];
//     let idx = 2;

//     if (name) { updates.push(`name = $${idx++}`); params.push(name); }
//     if (mail) { updates.push(`mail = $${idx++}`); params.push(mail); }
//     if (password) {
//       const hash = await bcrypt.hash(password, 10);
//       updates.push(`password = $${idx++}`);
//       params.push(hash);
//     }
//     if (updates.length === 0) {
//       return res.status(400).json({ message: 'No data to update' });
//     }

//     const query = `
//       UPDATE users SET ${updates.join(', ')}
//       WHERE user_id = $1
//       RETURNING user_id, name, mail, verified, admin;
//     `;
//     const { rows } = await pool.query(query, params);
//     res.json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/users – admin only
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  // try {
  //   const result = await pool.query(`
  //     SELECT user_id AS "userId", name, mail, verified, admin, registered_at AS "registeredAt", last_activity AS "lastActivity"
  //     FROM users
  //     ORDER BY registered_at DESC
  //   `);
  //   res.json(result.rows);
  // } catch (err) {
  //   console.error('GET /api/users error:', err);
  //   res.status(500).json({ message: 'Failed to load users' });
  // }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT 
        u.user_id AS "userId",
        u.name,
        u.mail,
        u.verified,
        u.admin,
        u.registered_at AS "registeredAt",
        COALESCE(MAX(r.created), u.registered_at) AS "lastActivity",
        COUNT(r.*) FILTER (WHERE r.from_time >= NOW()) AS "upcomingReservationCount",
        COUNT(r.*) AS "totalReservationCount"
      FROM users u
      LEFT JOIN reservation_groups g ON g.user_id = u.user_id
      LEFT JOIN reservations r ON r.group_id = g.group_id
      GROUP BY u.user_id
      ORDER BY u.user_id;
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/users/:userId - Admin can update any user
router.patch('/:userId', verifyToken, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { name, mail, admin, verified } = req.body;

  try {
    const updates = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) { updates.push(`name = $${idx++}`); params.push(name); }
    if (mail !== undefined) { updates.push(`mail = $${idx++}`); params.push(mail); }
    if (admin !== undefined) { updates.push(`admin = $${idx++}`); params.push(admin); }
    if (verified !== undefined) { updates.push(`verified = $${idx++}`); params.push(verified); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No data to update' });
    }

    params.push(userId); // userId is always last
    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`;

    const { rows } = await pool.query(query, params);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating user (admin):', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

