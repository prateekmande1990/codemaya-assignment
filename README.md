# Smart Q&A API (Node.js + Express + MongoDB + LLM)

Take-home assignment implementation for CodeMaya.

## Features

- Clean modular architecture: `routes/`, `controllers/`, `services/`, `models/`, `middleware/`
- Seeded knowledge base (`npm run seed`) with domain-specific documents
- `GET /api/docs` for document sanity check
- `POST /api/ask` RAG-style endpoint:
  - retrieves top documents by keyword scoring
  - builds prompt via LangChain `PromptTemplate`
  - returns schema-enforced JSON: `{ answer, sources, confidence }`
- Context-grounded answers only (explicit fallback when not in docs)
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login` (JWT)
- JWT-protected `/api/ask`
- Per-user rate limiting for `/api/ask` (10 requests/minute) persisted in MongoDB
- Structured logging for each ask call: `userId`, truncated `question`, `latencyMs`, `confidence`
- Global Express error handling (no raw stack trace leakage in production)
- Bonus: `GET /api/ask/history` (last 10 user Q&A)
- Bonus: Docker + docker-compose
- Test: passing Jest/Supertest test for `/api/ask`

## Tech Stack

- Node.js, Express
- MongoDB + Mongoose
- LangChain core (`PromptTemplate`)
- OpenAI-compatible LLM client (`openai` SDK)
- Zod for validation and structured output checks
- JWT + bcrypt
- Jest + Supertest

## Setup (Under 5 minutes)

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
cp .env.example .env
```

(Windows PowerShell)

```powershell
Copy-Item .env.example .env
```

3. Ensure MongoDB is running locally, or use Docker compose.

4. Seed documents:

```bash
npm run seed
```

5. Start app:

```bash
npm run dev
```

Server runs on `http://localhost:5000` by default.

## Environment Variables

See `.env.example`:

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `LLM_API_KEY`
- `LLM_MODEL`
- `LLM_BASE_URL`
- `ALLOW_MOCK_LLM`
- `ASK_RATE_LIMIT_PER_MINUTE`

### LLM Notes

- By default this uses OpenAI-compatible chat completion.
- If no API key is available, you can set `ALLOW_MOCK_LLM=true` for local/testing.

## API Endpoints + cURL

### Health

```bash
curl http://localhost:5000/health
```

### 1) Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 2) Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3) List docs

```bash
curl http://localhost:5000/api/docs
```

### 4) Ask (JWT required)

```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"question":"What is the refund policy?"}'
```

Example response:

```json
{
  "answer": "Refunds are processed within 5-7 business days after verification.",
  "sources": ["<doc_id>"],
  "confidence": "high"
}
```

### 5) Ask history (last 10)

```bash
curl http://localhost:5000/api/ask/history \
  -H "Authorization: Bearer <TOKEN>"
```

## Testing

```bash
npm test
```

Includes a passing Supertest test for `POST /api/ask`.

## Docker (Bonus)

1. Create `.env` from `.env.example` and update values.
2. Run:

```bash
docker compose up --build
```

3. Seed from app container (optional):

```bash
docker compose exec app npm run seed
```

## Project Structure

```text
src/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
scripts/
  seed.js
tests/
  ask.test.js
```
