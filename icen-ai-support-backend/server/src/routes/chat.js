import { Router } from 'express'
import { requireAuth, getUserFromToken } from '../middleware/auth.js'
import getSupabaseClient from '../../../src/db.js'
import { getRecentChats, saveUserMessage } from '../../../src/services/chatService.js'

const router = Router()

// Proxy / history endpoints for chat
router.get('/history', requireAuth, getUserFromToken, async (req, res) => {
  try {
    const user = req.user
    const recent = await getRecentChats(user.id, 50)
    return res.json({ ok: true, chats: recent })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Failed to fetch history', error: e.message })
  }
})

router.post('/send', requireAuth, getUserFromToken, async (req, res) => {
  try {
    const user = req.user
    const { message, metadata = {} } = req.body
    if (!message) return res.status(400).json({ ok: false, message: 'message is required' })

    // Save user message to server DB (delegates to shared service)
    await saveUserMessage(user.id, message, metadata)

    // Forward to ai-proxy (local or deployed) - prefer local ai-proxy on same host/port
    const apiUrl = process.env.AI_PROXY_URL || `http://localhost:${process.env.PORT || 3000}/ai-proxy`
    const token = req.userToken
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ message, metadata }),
    })
    const data = await resp.json()
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Failed to send message', error: e.message })
  }
})

export default router
