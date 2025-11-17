import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.post('/ai-proxy', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ ok: false, message: 'Message is required' })

  // Simple echo AI for testing; replace with OpenAI call if needed
  const reply = `AI says: ${message}`
  return res.json({ ok: true, reply })
})

const PORT = process.env.AI_PROXY_PORT || 3001
app.listen(PORT, () => console.log(`AI Proxy running on http://localhost:${PORT}`))
