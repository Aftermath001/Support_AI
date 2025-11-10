import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }))
app.use(express.json())
app.use(morgan('dev'))

// Supabase client (service role optional)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_*_KEY in environment')
}
export const supabase = createClient(supabaseUrl, supabaseKey)

// Routes
import healthRouter from './src/routes/health.js'
import authRouter from './src/routes/auth.js'
import chatRouter from './src/routes/chat.js'
import adminRouter from './src/routes/admin.js'

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)
app.use('/api/admin', adminRouter)

app.get('/api', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
