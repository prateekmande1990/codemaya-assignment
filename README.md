# Smart Q&A API (Node.js + Express + MongoDB + Groq)

Take-home assignment implementation for CodeMaya.

## Features

- Modular architecture: `routes/`, `controllers/`, `services/`, `models/`, `middleware/`, `config/`
- Seeded knowledge base (`npm run seed`) with domain-specific documents
- `GET /api/docs` for document sanity check
- `POST /api/ask` RAG pipeline:
  - keyword-based top-N retrieval
  - LangChain `PromptTemplate` prompt construction
  - schema-enforced structured response: `{ answer, sources, confidence }`
- Strict context grounding (explicit fallback when answer is not in docs)
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login` (JWT)
- JWT-protected `/api/ask` and `/api/ask/history`
- Per-user rate limiting for `/api/ask` (10/min by default), persisted in MongoDB
- Structured request logging (`requestId`, `userId`, truncated `question`, `latencyMs`, `confidence`)
- Centralized error handling with safe production responses
- Bonus: `GET /api/ask/history` (last N Q&A for authenticated user)
- Bonus: Dockerized via `Dockerfile` + `docker-compose.yml`
- Tests with Jest + Supertest
- OpenAPI + Swagger docs

## Tech Stack

- Node.js, Express
- MongoDB + Mongoose
- LangChain core (`PromptTemplate`)
- Groq (OpenAI-compatible API) via `openai` SDK
- Zod validation
- JWT + bcrypt
- Jest + Supertest

## Setup (Under 5 minutes)

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Fill `.env` values (`MONGO_URI`, `GROQ_API_KEY`, `JWT_SECRET`).

4. Seed sample docs:

```bash
npm run seed
```

5. Start server:

```bash
npm run dev
```

Default server: `http://localhost:5000`

## Environment Variables

See `.env.example` for all variables:

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `MONGO_MAX_RETRIES`
- `MONGO_RETRY_DELAY_MS`
- `ENABLE_IN_MEMORY_MONGO_FALLBACK`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `LLM_BASE_URL`
- `ALLOW_MOCK_LLM`
- `ASK_RATE_LIMIT_PER_MINUTE`
- `ASK_HISTORY_LIMIT`

Groq defaults:

```env
GROQ_MODEL=llama-3.1-8b-instant
LLM_BASE_URL=https://api.groq.com/openai/v1
```

## OpenAPI + Swagger

- OpenAPI JSON: `GET /api/docs/openapi.json`
- Swagger UI: `GET /api/docs/swagger`

## API Endpoints + cURL

### Health

```bash
curl http://localhost:5000/health
```

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### List Documents

```bash
curl http://localhost:5000/api/docs
```

### Ask (JWT required)

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

### Ask History (JWT required)

```bash
curl http://localhost:5000/api/ask/history \
  -H "Authorization: Bearer <TOKEN>"
```

## Testing

```bash
npm test
```

Current test coverage includes `/api/ask` auth, validation, rate limit, and success flows, plus docs endpoints.

## Docker

```bash
docker compose up --build
```

(Optional) seed from container:

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
  prompts/
  routes/
  services/
  utils/
scripts/
  seed.js
tests/
  ask.test.js
  docs.test.js
```
