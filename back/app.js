require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const itemRoutes = require('./routes/item.routes');
const requestRoutes = require('./routes/request.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Sharek backend is running' });
});

app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
});

module.exports = app;
