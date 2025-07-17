const pool = require('../db');

exports.getAllReservations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reservations ORDER BY from_time');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createReservation = async (req, res) => {
    const { court_id, user_id, from_time, to_time, text } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO reservations (court_id, user_id, from_time, to_time, text) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [court_id, user_id, from_time, to_time, text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
