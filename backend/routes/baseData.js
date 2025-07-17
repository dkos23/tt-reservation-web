const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/base-data
router.get('/', async (req, res) => {
  try {
    const [courtsRes, configRes] = await Promise.all([
      pool.query('SELECT court_id, name FROM courts ORDER BY court_id'),
      pool.query('SELECT * FROM config LIMIT 1')
    ]);

    const configDb = configRes.rows[0];
    const config = {
      announcement: configDb.announcement,
      visibleHours: configDb.visible_hours,
      orgName: configDb.org_name,
      serverMail: configDb.server_mail,
      url: configDb.url,
      reservationDaysInAdvance: configDb.reservation_days_in_advance,
      reservationMaxActiveCount: configDb.reservation_max_active_count,
      timeZone: configDb.time_zone,
    };

    // const templates = {
    //   reservationTos: { body: "<h1>Preis</h1><p>15 Euro pro Stunde...</p>" },
    //   systemTos: { body: "<h1>Nutzungsordnung</h1><ul><li>...</li></ul>" },
    //   infoPage: { body: "<h1>Hinweise</h1><ul><li>...test...</li></ul>" },
    // };

    const templatesResult = await pool.query(`
      SELECT key, subject, body
      FROM templates
    `);
    const templates = {};
    templatesResult.rows.forEach(t => {
      templates[t.key] = { subject: t.subject, body: t.body };
    });

    const courts = courtsRes.rows.map(c => ({
      courtId: c.court_id,
      name: c.name,
    }));

    res.setHeader('Cache-Control', 'no-store');

    res.json({ config, courts, templates });

    // console.log("config:", config);

  } catch (err) {
    console.error("base-data error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
