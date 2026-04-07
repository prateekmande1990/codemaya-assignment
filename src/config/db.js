const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  mongoUri,
  mongoMaxRetries,
  mongoRetryDelayMs,
  enableInMemoryMongoFallback,
} = require('./env');

let memoryServer;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDb(uri = mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}

async function connectInMemoryMongo() {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
    process.on('exit', async () => {
      if (memoryServer) await memoryServer.stop();
    });
  }

  const uri = memoryServer.getUri('codemaya_assignment_mem');
  await connectDb(uri);
  return uri;
}

async function connectDbWithRetry(uri = mongoUri) {
  let attempt = 0;

  while (mongoMaxRetries === 0 || attempt < mongoMaxRetries) {
    try {
      attempt += 1;
      await connectDb(uri);
      return;
    } catch (err) {
      const attemptsLabel = mongoMaxRetries === 0 ? 'infinite' : String(mongoMaxRetries);
      const message = err?.message || 'Unknown MongoDB connection failure';

      console.error(
        `[DB] Connection attempt ${attempt}/${attemptsLabel} failed: ${message}. Retrying in ${mongoRetryDelayMs}ms...`
      );

      if (enableInMemoryMongoFallback) {
        try {
          const memUri = await connectInMemoryMongo();
          console.warn(`[DB] Falling back to in-memory MongoDB at ${memUri}`);
          return;
        } catch (fallbackErr) {
          console.error(`[DB] In-memory fallback failed: ${fallbackErr.message}`);
        }
      }

      await sleep(mongoRetryDelayMs);
    }
  }

  throw new Error('Exceeded MongoDB connection retry attempts.');
}

module.exports = {
  connectDb,
  connectDbWithRetry,
};
