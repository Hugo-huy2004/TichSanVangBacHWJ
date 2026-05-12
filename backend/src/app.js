const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const priceRoutes = require('./routes/priceRoutes');
const assetRoutes = require('./routes/assetRoutes');

const buildCorsOrigin = () => {
  if (!process.env.CLIENT_ORIGIN) {
    return true;
  }

  const allowedOrigins = process.env.CLIENT_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  };
};

const createApp = () => {
  const app = express();

  app.use(cors({ origin: buildCorsOrigin(), credentials: true }));
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ ok: true, service: 'tichtru-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/prices', priceRoutes);
  app.use('/api/assets', assetRoutes);

  app.use((error, _request, response, _next) => {
    const status = error.status || 500;
    response.status(status).json({ message: error.message || 'Internal Server Error' });
  });

  return app;
};

module.exports = { createApp };
