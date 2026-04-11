# Deployment Guide (Vercel + Render)

## 1. Deploy Backend (Render)

Use `render.yaml` in repository root.

### Required backend environment variables

- `PORT=4000`
- `FRONTEND_URL=https://<your-vercel-domain>`
- `MONGO_URI=<mongodb connection string>`
- `JWT_SECRET=<strong secret>`
- `JWT_EXPIRES_IN=7d`
- `GOOGLE_CLIENT_ID=<google oauth client id>`
- `GOOGLE_CLIENT_SECRET=<google oauth secret>`
- `GOOGLE_CALLBACK_URL=https://<render-domain>/auth/google/callback`
- `GEMINI_API_KEY=<google ai studio key>`
- `GEMINI_MODEL=gemini-2.5-flash`
- `QDRANT_URL=<qdrant endpoint>`
- `QDRANT_COLLECTION=rag_chunks`
- `EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2`

### Notes

- Use MongoDB Atlas free tier for production MongoDB.
- Use Qdrant Cloud free tier for vector DB.
- Verify `/health` after deployment.

## 2. Deploy Frontend (Vercel)

Create Vercel project with root directory: `apps/frontend`.

### Required frontend environment variables

- `NEXT_PUBLIC_API_URL=https://<render-domain>`

`apps/frontend/vercel.json` is included for build/dev/install commands.

### Recommended Vercel setup

- Connect the GitHub repository to Vercel.
- Keep Production Branch set to `main`.
- Vercel will create Preview Deployments for pull requests automatically.
- Vercel will promote a successful `main` push to production automatically.

## 3. Configure Google OAuth

In Google Cloud Console OAuth app config:

- Authorized redirect URI:
  - `http://localhost:4000/auth/google/callback` (dev)
  - `https://<render-domain>/auth/google/callback` (prod)

Set backend env vars with matching client id/secret/callback URL.

## 4. CI/CD Pipeline

This repository now includes `.github/workflows/ci-cd.yml`.

### What it does

- On every pull request to `main`: installs dependencies, runs `pnpm lint`, and runs `pnpm build`.
- On every push to `main`: runs the same validation checks.
- After a successful push to `main`, it can optionally trigger a Render backend deployment if you add a deploy hook secret.

### GitHub Actions requirements

- No secret is required for CI validation.
- Optional secret for backend CD:
  - `RENDER_DEPLOY_HOOK_URL=<your render deploy hook url>`

### Recommended release flow

1. Push a feature branch and open a pull request.
2. GitHub Actions validates the monorepo.
3. Vercel creates a preview deployment for the frontend automatically.
4. Merge into `main` after validation passes.
5. Vercel deploys the frontend to production from `main`.
6. Render deploys the backend either from its Git integration or through the optional deploy hook.

## 5. Post-Deploy Validation Checklist

- Register/login with email/password works.
- Google OAuth login redirects back to frontend and sets session.
- Chat streaming endpoint delivers chunks in real-time.
- Conversations persist and can be renamed/deleted.
- PDF upload processes and answers return grounded output.
- PDF preview and download return valid A4 PDF.
- Image analysis returns extracted text and visual Q&A.

## 6. Scaling Notes

- Add Redis for distributed rate limiting/session caching.
- Offload PDF/image processing jobs to worker queue for heavy traffic.
- Add observability (OpenTelemetry + structured logs).
- Add usage metering for SaaS billing tiers.
