const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const baseDataRouter = require('./routes/baseData');
app.use('/api/base-data', baseDataRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const courtsRoutes = require('./routes/courts');
app.use('/api/courts', courtsRoutes);

const reservationRoutes = require('./routes/reservations');
app.use('/api/reservations', reservationRoutes);

const reservationGroupRoutes = require('./routes/reservationGroups');
app.use('/api/reservation-group', reservationGroupRoutes);

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const configRoutes = require('./routes/config');
app.use('/api/config', configRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const templatesRouter = require('./routes/templates');
app.use('/api/templates', templatesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
