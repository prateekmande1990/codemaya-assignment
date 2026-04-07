const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const docsRoutes = require('./routes/docsRoutes');
const authRoutes = require('./routes/authRoutes');
const askRoutes = require('./routes/askRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    skip: () => process.env.NODE_ENV === 'test',
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/docs', docsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ask', askRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
