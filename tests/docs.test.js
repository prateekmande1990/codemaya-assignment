const request = require('supertest');

const app = require('../src/app');

describe('API docs endpoints', () => {
  it('returns OpenAPI JSON spec', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info?.title).toBe('CodeMaya Smart Q&A API');
  });

  it('serves Swagger UI', async () => {
    const res = await request(app).get('/api/docs/swagger');

    expect(res.statusCode).toBe(301);
    expect(res.headers.location).toBe('/api/docs/swagger/');
  });

  it('serves Swagger UI index page', async () => {
    const res = await request(app).get('/api/docs/swagger/');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('Swagger UI');
  });
});
