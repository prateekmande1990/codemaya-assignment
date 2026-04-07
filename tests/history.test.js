process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/AskHistory', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
}));

const AskHistory = require('../src/models/AskHistory');
const app = require('../src/app');

function mockFindChain(result) {
  const lean = jest.fn().mockResolvedValue(result);
  const limit = jest.fn().mockReturnValue({ lean });
  const skip = jest.fn().mockReturnValue({ limit });
  const sort = jest.fn().mockReturnValue({ skip });

  AskHistory.find.mockReturnValue({ sort });

  return { sort, skip, limit, lean };
}

describe('GET /api/ask/history pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses default pagination values (page=1, limit=10)', async () => {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', email: 'test@example.com' }, 'test-secret');

    const chain = mockFindChain([{ _id: 'h1', question: 'Q1' }]);
    AskHistory.countDocuments.mockResolvedValue(25);

    const res = await request(app).get('/api/ask/history').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(10);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('respects custom page and limit query params', async () => {
    const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', email: 'test@example.com' }, 'test-secret');

    const chain = mockFindChain([{ _id: 'h6', question: 'Q6' }]);
    AskHistory.countDocuments.mockResolvedValue(21);

    const res = await request(app)
      .get('/api/ask/history?page=2&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(chain.skip).toHaveBeenCalledWith(5);
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(res.body.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 21,
      totalPages: 5,
    });
  });
});
