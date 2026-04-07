const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const docsRoutes = require('./routes/docsRoutes');
const authRoutes = require('./routes/authRoutes');
const askRoutes = require('./routes/askRoutes');
const { openApiSpec } = require('./config/openapi');
const requestContextMiddleware = require('./middleware/requestContextMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

morgan.token('request-id', (req) => req.requestId || '-');

app.use(helmet());
app.use(requestContextMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms reqId=:request-id', {
    skip: () => process.env.NODE_ENV === 'test',
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/docs/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

app.use('/api/docs', docsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ask', askRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
