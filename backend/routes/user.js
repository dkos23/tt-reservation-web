const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth'); // your JWT middleware

const router = express.Router();

// PATCH /api/user/:userId
router.patch('/:userId', verifyToken, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { name, mail, password } = req.body;
  
  if (parseInt(userId, 10) !== req.user.userId) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  try {
    const updates = [];
    const params = [userId];
    let idx = 2;

    if (name) { updates.push(`name = $${idx++}`); params.push(name); }
    if (mail) { updates.push(`mail = $${idx++}`); params.push(mail); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password = $${idx++}`);
      params.push(hash);
    }
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No data to update' });
    }

    const query = `
      UPDATE users SET ${updates.join(', ')}
      WHERE user_id = $1
      RETURNING user_id, name, mail, verified, admin;
    `;
    const { rows } = await pool.query(query, params);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/user/:userId – Delete user (admin only)
router.delete('/:userId', verifyToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    // Delete reservations linked to this user
    await pool.query(`
      DELETE FROM reservations
      WHERE group_id IN (
        SELECT group_id FROM reservation_groups WHERE user_id = $1
      );
    `, [userId]);

    // Delete reservation groups
    await pool.query(`DELETE FROM reservation_groups WHERE user_id = $1`, [userId]);

    // Delete the user
    await pool.query(`DELETE FROM users WHERE user_id = $1`, [userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;