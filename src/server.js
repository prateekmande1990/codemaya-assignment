const app = require('./app');
const { connectDb } = require('./config/db');
const { port } = require('./config/env');

async function start() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error('Server start failed:', err.message);
    process.exit(1);
  }
}

start();
