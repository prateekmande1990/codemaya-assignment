const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const docsRoutes = require('./routes/docsRoutes');
const askRoutes = require('./routes/askRoutes');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/docs', docsRoutes);
app.use('/api/ask', askRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
