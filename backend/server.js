require('dotenv').config();

const { connectDatabase } = require('./src/config/database');
const { createApp } = require('./src/app');

const port = process.env.PORT || 4000;

const start = async () => {
  await connectDatabase();

  const app = createApp();
  app.listen(port, () => {
    // Keep startup output minimal for local development.
    console.log(`Server running on port ${port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});