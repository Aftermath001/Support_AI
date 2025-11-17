import { Router } from 'express'
import { requireAuth, getUserFromToken } from '../middleware/auth.js'
import { getRecentChats, saveUserMessage, saveAIMessage } from '../../../src/services/chatService.js'
import fetch from 'node-fetch'

const router = Router()

// Get chat history
router.get('/history', requireAuth, getUserFromToken, async (req, res) => {
  try {
    const user = req.user
    const chats = await getRecentChats(user.id, 50)
    return res.json({ ok: true, chats })
  } catch (e) {
    console.error('Error fetching chat history:', e)
    return res.status(500).json({ ok: false, message: 'Failed to fetch history', error: e.message })
  }
})

// Send message
router.post('/send', requireAuth, getUserFromToken, async (req, res) => {
  try {
    const user = req.user
    const { message, metadata = {} } = req.body
    if (!message) return res.status(400).json({ ok: false, message: 'Message is required' })

    // Save user message
    await saveUserMessage(user.id, message, metadata)

    // Forward to AI proxy
    const apiUrl = process.env.AI_PROXY_URL || 'http://localhost:3001/ai-proxy'
    const token = req.userToken || ''

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ message, metadata }),
    })

    let data
    try { data = await resp.json() } 
    catch (jsonErr) { return res.status(500).json({ ok: false, message: 'Invalid AI proxy response' }) }

    if (data?.reply) {
      await saveAIMessage(user.id, data.reply, metadata)
    }

    return res.json(data)
  } catch (e) {
    console.error('Failed to send message:', e)
    return res.status(500).json({ ok: false, message: 'Failed to send message', error: e.message })
  }
})

export default router
