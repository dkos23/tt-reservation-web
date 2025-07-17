const jwt = require('jsonwebtoken');
require('dotenv').config();
const { JWT_SECRET } = process.env;

function requireAuth(req, res, next) {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ message: 'missing token' });
  try {
    req.user = jwt.verify(auth, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'invalid token' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.admin) return res.status(403).json({ message: 'admin only' });
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
