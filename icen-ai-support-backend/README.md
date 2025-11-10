# ICEN AI Support Agent — Backend

Backend for ICEN AI Support Agent using JavaScript (ES2022) and Supabase. Provides authentication, database schema, secure AI call flow via Supabase Edge Function proxying to OpenAI, along with tests, linting, and CI.

## Prerequisites
- Node.js 18+
- Supabase project (URL, anon key, service role key)
- OpenAI API key

## Setup
```bash
git clone <repo-url>
cd icen-ai-support-backend
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_*_KEY, OPENAI_API_KEY
npm install
```

## Local development
Two options:
1) Run the edge handler locally with Node HTTP server (for quick testing):
```bash
npm run start
```
It exposes POST http://localhost:3000/ai-proxy

2) Supabase Edge Functions:
- Install supabase CLI and login to your project.
- Create and link project, then deploy or serve the function.
- Apply migrations using Supabase SQL editor or CLI.

## Database schema
Migration file: `supabase/migrations/001_init_schema.sql`.
Apply it in Supabase SQL editor or CLI:
```bash
# Using Supabase Studio (recommended initially): paste the SQL and run
# Or CLI example:
# supabase db push  # if using local dev
```

Tables: users, chats, faqs, feedback. Index: idx_chats_user_created.

## API — ai-proxy
POST /ai-proxy (local) or Supabase Edge endpoint:
- URL (Supabase): https://<project-ref>.functions.supabase.co/ai-proxy
- Headers: Authorization: Bearer <supabase_user_jwt>, Content-Type: application/json
- Body:
```json
{ "message": "text", "metadata": {"source": "web"} }
```
- Response:
```json
{ "reply": "...", "usage": { }, "savedChatId": "uuid" }
```

### curl examples
```bash
# Local
curl -sS -X POST http://localhost:3000/ai-proxy \
  -H "Authorization: Bearer $SUPABASE_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Supabase deployed function
curl -sS -X POST https://$SUPABASE_PROJECT_REF.functions.supabase.co/ai-proxy \
  -H "Authorization: Bearer $SUPABASE_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

## Auth and DB helpers
- src/db.js: server-side Supabase client wrapper.
- src/services/chatService.js: save/get chat messages.
- src/ai/promptBuilder.js: prompt composition injecting FAQs and context.
- src/utils/rateLimiter.js: in-memory token bucket (per-process). Not suitable for distributed deployments.

## Tests
Jest unit tests for prompt builder and chat service.
```bash
npm test
```

## Lint and format
```bash
npm run lint
npm run format
```

## Deployment
- Ensure .env is configured in deployment environment (never commit secrets).
- For Supabase Edge Functions:
  - Install supabase CLI
  - supabase functions deploy ai-proxy --project-ref <ref>
- Add CI variables if needed. GitHub Actions runs lint and tests on push/PR.

## Security notes
- Do not log secrets. Environment variables are required for Supabase and OpenAI keys.
- Rate limiting is in-memory and only protects a single process. For production, use Redis or Supabase-based counters.
- Consider GDPR: chat logs may contain PII. Establish a retention policy, offer user deletion, and restrict access based on roles.

## Next steps
- Frontend integration (login, chat UI)
- Multilingual support
- Distributed rate limiter using Redis or KV
- Observability: structured logging, tracing
