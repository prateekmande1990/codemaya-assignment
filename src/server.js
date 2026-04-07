const app = require('./app');
const { connectDbWithRetry } = require('./config/db');
const { port } = require('./config/env');
const { logInfo, logError } = require('./utils/logger');

async function start() {
  try {
    await connectDbWithRetry();
    app.listen(port, () => {
      logInfo('server_started', { port });
    });
  } catch (err) {
    logError('server_start_failed', {
      error: err.message,
      hint: 'Ensure MongoDB is running locally or start Docker Desktop and run `docker compose up -d mongo`.',
    });
    process.exit(1);
  }
}

start();
