const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDb(uri = mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}

module.exports = {
  connectDb,
};
