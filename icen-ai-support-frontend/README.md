# ICEN AI Support Agent — Frontend

Production-ready React (Vite) app connecting to Supabase backend for ICEN staff, researchers, and partners to chat with the AI assistant, browse FAQs, and submit feedback.

## Tech Stack
- React 18 + Vite
- TailwindCSS
- Supabase JS client
- Zustand for state
- React Router v6
- Lucide Icons
- Jest + React Testing Library

## Prerequisites
- Node.js 18+
- Supabase project with tables: users(id, role), chat_sessions(id, created_at), messages(session_id, role, content, created_at), faqs(id, question, answer, tags), feedback(session_id, rating, comment, created_at)
- Supabase Edge Function: functions/ai-proxy

## Environment
Create `.env` (or use `.env.local`) with:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Install and Run
```
pnpm i # or npm i / yarn
pnpm dev
```
Open http://localhost:5173

## Scripts
- dev: vite
- build: vite build
- preview: vite preview
- test: jest
- lint: eslint .

## Supabase Connection
- Config in `src/utils/supabaseClient.js`
- Edge function call in `src/pages/Chat.jsx` using `supabase.functions.invoke('ai-proxy', { body })`

## Routes
- /login — Email/password auth, redirects to /chat
- /chat — Main chat UI with history, AI replies, end session
- /faq — FAQ list with search
- /feedback — Rate last interaction
- /admin — Admin dashboard (requires users.role = 'admin')

## UI/Branding
Tailwind theme colors:
- primary: #2E7D32
- accent: #66BB6A
- background: #F5F9F6

## Accessibility Checklist
- Semantic elements, labels for inputs and controls
- aria-live for chat updates
- Keyboard accessible buttons/links
- Sufficient color contrast

## Testing
```
pm run test
```
- Unit tests: src/tests/*.test.jsx
- JSDOM environment

## Deployment
- Build: `npm run build`
- Deploy `dist/` to Vercel/Netlify
- Ensure env vars set in hosting provider

## Offline
- Basic online/offline indicator in Chat page; extend with Service Worker if needed.
