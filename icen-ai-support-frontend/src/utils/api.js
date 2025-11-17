const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Get stored Supabase token
function getToken() {
  return localStorage.getItem('sb-token') || ''
}

async function getHealth() {
  const res = await fetch(`${API_URL}/api/health`)
  if (!res.ok) {
    const errText = await res.text()
    console.error('Health check failed:', errText)
    throw new Error('Failed to fetch health')
  }
  return res.json()
}

async function getChatHistory() {
  const token = getToken()
  const res = await fetch(`${API_URL}/api/chat/history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('Chat history fetch failed:', errText)
    throw new Error('Failed to fetch chat history')
  }
  return res.json()
}

async function sendChatMessage(message, metadata = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}/api/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, metadata }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Send chat message failed:', errText)
    throw new Error('Failed to send message')
  }

  const data = await res.json()
  return data // data should contain { reply }
}

async function getAdminStats() {
  const token = getToken()
  const res = await fetch(`${API_URL}/api/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('Admin stats fetch failed:', errText)
    throw new Error('Failed to fetch admin stats')
  }
  return res.json()
}

export { getHealth, getChatHistory, sendChatMessage, getAdminStats, API_URL }
