const app = require('./app');
const { connectDb } = require('./config/db');
const { port } = require('./config/env');
const { logInfo, logError } = require('./utils/logger');

async function start() {
  try {
    await connectDb();
    app.listen(port, () => {
      logInfo('server_started', { port });
    });
  } catch (err) {
    logError('server_start_failed', { error: err.message });
    process.exit(1);
  }
}

start();
