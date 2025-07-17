const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();
const { JWT_SECRET } = process.env;
const nodemailer = require('nodemailer');

// Helper to generate JWT token
function createToken(user) {
  return jwt.sign({
    userId: user.user_id,
    admin: user.admin  // important
  }, JWT_SECRET, { expiresIn: '1h' });
}

// POST /api/register
router.post('/register', async (req, res) => {
  const { name, mail, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, mail, verified, admin, registered_at, last_activity, password) VALUES ($1,$2,false,false,NOW(),NOW(),$3) RETURNING user_id, name, mail, verified, admin',
      [name, mail, hash]
    );
    const user = rows[0];
    res.json({ token: createToken(user), ...user });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'mail already registered' });
    res.status(500).json({ message: err.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { mail, password } = req.body;
  const { rows } = await pool.query('SELECT user_id, name, mail, verified, admin, password FROM users WHERE mail = $1', [mail]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'wrong login' });
  }

  // Update last_activity timestamp
  await pool.query(
    'UPDATE users SET last_activity = NOW() WHERE user_id = $1',
    [user.user_id]
  );
  delete user.password;
  res.json({ token: createToken(user), ...user });
});

// MAIL
router.post('/send-verify-mail', async (req, res) => {
  const { mail } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
  const user = rows[0];
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1d' });

  // const transporter = nodemailer.createTransport({
  //   service: 'Gmail', // or use a custom SMTP config
  //   auth: {
  //     user: process.env.MAIL_USER,
  //     pass: process.env.MAIL_PASS,
  //   },
  // });
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    ignoreTLS: true,
  });

  const url = `${process.env.FRONTEND_URL}/verify-mail/${token}`;

  try {
    await transporter.sendMail({
      from: `"Tischtennis Club" <${process.env.MAIL_USER}>`,
      to: mail,
      subject: 'Bestätigen Sie Ihre E-Mail Adresse',
      html: `<p>Bitte klicken Sie auf den folgenden Link, um Ihre E-Mail Adresse zu verifizieren:</p>
             <a href="${url}">${url}</a>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Senden der E-Mail' });
  }
});

router.post('/verify-mail', async (req, res) => {
  //LOG:
  console.log("🔁 POST /verify-mail called");
  try {
    const { token } = req.body;
    //LOG:
    // console.log("📦 Received token:", token);
    const payload = jwt.verify(token, JWT_SECRET);
    const { userId } = payload;

    const { rows } = await pool.query(
      'UPDATE users SET verified = true WHERE user_id = $1 RETURNING user_id, name, mail, verified, admin',
      [userId]
    );
    const user = rows[0];
    //LOG:
    console.log('✅ Verified user:', user);

    const newToken = createToken(user);
    res.json({ token: newToken, ...user });
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
