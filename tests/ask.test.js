process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/RateLimitWindow', () => ({
  findOneAndUpdate: jest.fn(),
}));

jest.mock('../src/models/AskHistory', () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

jest.mock('../src/services/retrievalService', () => ({
  retrieveRelevantDocs: jest.fn(),
}));

jest.mock('../src/services/llmService', () => ({
  generateGroundedAnswer: jest.fn(),
}));

const RateLimitWindow = require('../src/models/RateLimitWindow');
const AskHistory = require('../src/models/AskHistory');
const { retrieveRelevantDocs } = require('../src/services/retrievalService');
const { generateGroundedAnswer } = require('../src/services/llmService');

const app = require('../src/app');

describe('POST /api/ask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/ask').send({ question: 'What is refund policy?' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 for invalid question payload', async () => {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', email: 'test@example.com' }, 'test-secret');

    RateLimitWindow.findOneAndUpdate.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .post('/api/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'hi' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Too small');
    expect(Array.isArray(res.body.issues)).toBe(true);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', email: 'test@example.com' }, 'test-secret');

    RateLimitWindow.findOneAndUpdate.mockResolvedValue({ count: 11 });

    const res = await request(app)
      .post('/api/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'What is the refund policy?' });

    expect(res.statusCode).toBe(429);
    expect(res.headers['retry-after']).toBeDefined();
    expect(Number(res.headers['retry-after'])).toBeGreaterThanOrEqual(1);
    expect(res.body.message).toContain('Rate limit exceeded');
  });

  it('returns 500 for invalid rate limit state', async () => {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', email: 'test@example.com' }, 'test-secret');

    RateLimitWindow.findOneAndUpdate.mockResolvedValue({ count: Number.NaN });

    const res = await request(app)
      .post('/api/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'What is the refund policy?' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal Server Error');
  });

  it('returns structured grounded answer with confidence', async () => {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', email: 'test@example.com' }, 'test-secret');

    RateLimitWindow.findOneAndUpdate.mockResolvedValue({ count: 1 });

    retrieveRelevantDocs.mockResolvedValue({
      docs: [
        {
          _id: 'doc_id_1',
          title: 'Refund Policy',
          content: 'Refunds are processed within 5-7 business days.',
          tags: ['refund'],
          retrievalScore: 10,
        },
      ],
      confidence: 'high',
      topScore: 10,
    });

    generateGroundedAnswer.mockResolvedValue({
      answer: 'Refunds are processed within 5-7 business days.',
      sources: ['doc_id_1'],
    });

    AskHistory.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'What is the refund policy?' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      answer: 'Refunds are processed within 5-7 business days.',
      sources: ['doc_id_1'],
      confidence: 'high',
    });
  });
});
