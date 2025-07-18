const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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

// Mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Mail helper reset
async function sendResetEmail(to, token) {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const mailOptions = {
    from: 'no-reply@yourapp.com',
    to,
    subject: 'Passwort zurücksetzen',
    html: `<p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p><a href="${resetLink}">${resetLink}</a>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ E-Mail gesendet:', info.response || info);
  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mail:', error);
  }
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

  //TODO - change for production
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
  // console.log("🔁 POST /verify-mail called");
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

// POST /api/password-reset-request
router.post('/password-reset-request', async (req, res) => {
  const { mail } = req.body;
  if (!mail) {
    console.error("❗ No email provided in request body");
    return res.status(400).json({ message: "Email is required" });
  }

  let user;
  try {
    const { rows } = await pool.query('SELECT user_id FROM users WHERE mail = $1', [mail]);
    user = rows[0];
  } catch (dbErr) {
    console.error("❌ DB error fetching user:", dbErr);
    return res.status(500).json({ message: "Database error" });
  }

  if (!user) {
    console.log("✅ Email not registered, responding OK for security");
    return res.status(200).json({ message: "If registered, you'll receive an email." });
  }

  const token = crypto.randomBytes(32).toString('hex');

  try {
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = NOW() + interval \'1 hour\' WHERE user_id = $2',
      [token, user.user_id]
    );
  } catch (dbErr) {
    console.error("❌ DB error updating token:", dbErr);
    return res.status(500).json({ message: "Database error" });
  }

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  // console.log("🔗 Reset link to send:", resetLink);

  // TODO - change for productiv
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    ignoreTLS: true,
    logger: true,
    debug: true
  });

  try {
    const info = await transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USER}>`,
      to: mail,
      subject: 'Rerservierungssystem Passwort zurücksetzen',
      html: `<p>Klicken Sie auf diesen Link zum Zurücksetzen:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    // console.log("📧 Email sent:", info);
    return res.status(200).json({ message: "If registered, you'll receive an email." });

  } catch (mailErr) {
    console.error("❌ Mailer error:", mailErr);
    return res.status(500).json({ message: "Failed to send email" });
  }
});

// POST /api/password-reset
router.post('/password-reset', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    console.error("❗ Missing token or password!");
    return res.status(400).json({ message: "Token oder Passwort fehlt" });
  }

  try {
    const result = await pool.query(
      'SELECT user_id, reset_password_expires FROM users WHERE reset_password_token = $1',
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      console.error("❗ Invalid reset token:", token);
      return res.status(400).json({ message: "Ungültiges Reset-Token" });
    }
    if (new Date() > user.reset_password_expires) {
      console.warn("❗ Reset token expired for user:", user.user_id);
      return res.status(400).json({ message: "Reset-Token abgelaufen" });
    }

    console.log("✅ Token valid. Hashing new password...");
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE users
       SET password = $1, reset_password_token = NULL, reset_password_expires = NULL
       WHERE user_id = $2`,
      [hash, user.user_id]
    );
    res.json({ message: "Passwort erfolgreich zurückgesetzt" });
  } catch (err) {
    console.error("❌ Error in password-reset:", err);
    res.status(500).json({ message: err.message });
  }
});



// POST /api/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const { rows } = await pool.query(`
      SELECT user_id FROM users 
      WHERE reset_password_token = $1 AND reset_password_expires > NOW()
    `, [token]);

    const user = rows[0];
    if (!user) {
      return res.status(400).json({ message: 'Ungültiger oder abgelaufener Token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(`
      UPDATE users 
      SET password = $1, reset_password_token = NULL, reset_password_expires = NULL 
      WHERE user_id = $2
    `, [hashedPassword, user.user_id]);

    res.status(200).json({ message: 'Passwort erfolgreich zurückgesetzt' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
