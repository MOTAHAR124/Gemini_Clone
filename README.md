# Gemini-Clone

Production-grade full-stack AI application with:
- Real-time Gemini-style streaming chat
- MongoDB-backed persistent conversation history
- PDF RAG with vector search (Qdrant)
- AI-generated PDF preview + download
- Vision/image understanding workflows
- Email/password and Google OAuth auth
- Built-in System Design page with architecture, sequence, and deployment diagrams

## Monorepo Structure

```text
apps/
  backend/   # NestJS API
  frontend/  # Next.js App Router UI
docs/        # API contracts, schema, deployment
```

## Local Development

1. Start infrastructure:

```bash
docker compose up -d
```

2. Configure environment variables:

- Copy `.env.example` to `.env` (root)
- Copy `apps/backend/.env.example` to `apps/backend/.env`
- Copy `apps/frontend/.env.example` to `apps/frontend/.env.local`

3. Install dependencies and run:

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## System Design View

- Route: `http://localhost:3000/system-design`
- In-app access: Sidebar -> `Settings and help` -> `System Design`
- Behavior: opens in a new browser tab

## Tech Stack

- Frontend: Next.js 16, TypeScript, Tailwind CSS
- Backend: NestJS 10, TypeScript, Mongoose, Passport
- LLM: Gemini 2.5 Flash via Google Generative AI SDK
- Data: MongoDB + Qdrant vector DB
- Embeddings: `Xenova/all-MiniLM-L6-v2` (free, local model)

## Security and Reliability

- JWT-based auth with guarded routes
- Google OAuth flow (`/auth/google`)
- Request validation via class-validator + global ValidationPipe
- Basic rate limiting via Nest Throttler
- Helmet + CORS
- Retry logic for rate-limited Gemini calls
- RAG system prompt enforces context-only answers

## Docs

- API contracts: `docs/API_CONTRACTS.md`
- Database schema: `docs/DATABASE_SCHEMA.md`
- Example prompts: `docs/EXAMPLE_PROMPTS.md`
- Deployment guide: `docs/DEPLOYMENT.md`
- Architecture notes: `docs/ARCHITECTURE.md`
