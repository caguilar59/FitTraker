require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo').default;
const crypto = require('crypto');
const createApp = require('./app');

async function start() {
  const production = process.env.NODE_ENV === 'production';
  if (production && !process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is required in production');
  await mongoose.connect(process.env.MONGO_URI);
  const store = MongoStore.create({ client: mongoose.connection.getClient(), dbName: mongoose.connection.name, collectionName: 'sessions' });
  store.on('error', () => console.error('Session storage error'));
  const app = createApp({ store, production, secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex') });
  app.listen(process.env.PORT || 3000, () => {
    console.log('MongoDB connected');
    console.log(`Open FitTraker at http://localhost:${process.env.PORT || 3000}`);
  });
}
start().catch((error) => {
  console.error('Unable to start server; check database configuration');
  console.error('Actual error:', error);
  process.exitCode = 1;
});
