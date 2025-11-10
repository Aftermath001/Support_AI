const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/health`)
  if (!res.ok) throw new Error('Failed to fetch health')
  return res.json()
}

export async function getChatHistory() {
  const res = await fetch(`${API_URL}/api/chat/history`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('sb-token')}`,
    }
  })
  if (!res.ok) throw new Error('Failed to fetch chat history')
  return res.json()
}

export async function sendChatMessage(message) {
  const res = await fetch(`${API_URL}/api/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('sb-token')}`,
    },
    body: JSON.stringify({ message })
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export async function getAdminStats() {
  const res = await fetch(`${API_URL}/api/admin`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('sb-token')}`,
    }
  })
  if (!res.ok) throw new Error('Failed to fetch admin stats')
  return res.json()
}

export { API_URL }
