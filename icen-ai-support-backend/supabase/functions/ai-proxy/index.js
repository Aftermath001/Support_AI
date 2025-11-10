import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { buildPrompt } from '../../../src/ai/promptBuilder.js';
import { getRecentChats, saveAIMessage, saveUserMessage } from '../../../src/services/chatService.js';
import { consume as rateConsume } from '../../../src/utils/rateLimiter.js';

// Edge function style handler that can also run with node for local testing

const requestSchema = z.object({
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

function getEnv() {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };
  for (const [k, v] of Object.entries(env)) {
    if (!v) console.warn(`[config] Missing env var ${k}`);
  }
  return env;
}

function getAuthUser(event) {
  // Supabase Edge Functions recommend validating Authorization header bearer token
  const auth = event.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  return supabase.auth.getUser(token);
}

async function handler(event) {
  try {
    if (event.method && event.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const body = await event.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid payload', details: parsed.error.errors }), {
        status: 400,
      });
    }

    // Auth
    const userRes = await getAuthUser(event);
    if (!userRes || userRes.error || !userRes.data?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const user = userRes.data.user;

    // Rate limit per user
    const allowed = rateConsume(user.id, { capacity: 10, refillIntervalMs: 60_000 });
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }

    const { message, metadata = {} } = parsed.data;

    // Save user message
    const savedUser = await saveUserMessage(user.id, message, metadata);

    // Fetch FAQs - simple approach: top-N by ts query or just limit
    const { SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY } = getEnv();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // naive search: get latest 5 faqs; for better relevance, use full-text or embeddings
    const { data: faqs } = await supabase.from('faqs').select('id,question,answer,tags').limit(5);

    const recentChats = await getRecentChats(user.id, 4);
    const prompt = buildPrompt({ faqs: faqs || [], recentChats, userProfile: { email: user.email } });

    // OpenAI call
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message },
      ],
      temperature: 0.2,
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    const usage = completion.usage || {};

    // Save AI message
    const savedAI = await saveAIMessage(user.id, reply, { usage });

    const result = { reply, usage, savedChatId: savedAI.id };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('[ai-proxy] error', { message: err.message, stack: err.stack });
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// Export for Supabase Edge Functions
export default handler;

// Local dev runner
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('index.js')) {
  const http = await import('node:http');
  const server = http.createServer(async (req, res) => {
    if (req.url === '/ai-proxy' && req.method === 'POST') {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', async () => {
        const body = Buffer.concat(chunks).toString('utf8');
        const event = new Request('http://localhost/ai-proxy', {
          method: 'POST',
          headers: req.headers,
          body,
        });
        const response = await handler(event);
        res.statusCode = response.status;
        for (const [k, v] of response.headers) res.setHeader(k, v);
        const text = await response.text();
        res.end(text);
      });
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  });
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`[ai-proxy] listening on :${port}`));
}
