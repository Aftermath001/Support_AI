import React, { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useChatStore } from '../store/useChatStore'
import useAuth from '../hooks/useAuth'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import Loader from '../components/Loader'
import HealthCheck from '../components/HealthCheck'
import { getChatHistory, sendChatMessage } from '../utils/api'

export default function Chat() {
  const { user, loading: authLoading } = useAuth()
  const { messages, addMessage, clear, loading, setLoading, setError } = useChatStore()
  const endRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Load chat history on mount
  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        setLoading(true)
        const { chats } = await getChatHistory()
        clear() // Clear any existing messages
        chats.forEach(chat => {
          addMessage({
            role: chat.sender === 'ai' ? 'assistant' : 'user',
            content: chat.message,
            created_at: chat.created_at
          })
        })
      } catch (e) {
        setError(e.message)
        console.error('Failed to load chat history:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function send(text) {
    const message = { role: 'user', content: text, created_at: new Date().toISOString() }
    addMessage(message)
    setLoading(true)
    setError(null)
  
    try {
      const data = await sendChatMessage(text)
      if (data?.reply) {
        const aiMessage = { role: 'assistant', content: data.reply, created_at: new Date().toISOString() }
        addMessage(aiMessage)
      } else {
        setError('AI did not return a reply')
      }
    } catch (error) {
      setError(error.message)
      console.error('Failed to send message:', error)
    }
    setLoading(false)
  }
  

  if (authLoading) return <div className="p-4">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <section className="grid grid-rows-[1fr_auto] h-[calc(100vh-120px)] gap-3">
      <div className="overflow-y-auto bg-white rounded-md p-4 shadow-sm space-y-4" aria-live="polite">
        <HealthCheck />
        {messages.length === 0 && !loading ? (
          <p className="text-gray-600">Start a conversation with ICEN AI. Ask about FAQs, research topics, or support policies.</p>
        ) : null}
        {messages.map((m, idx) => (
          <ChatMessage key={idx} message={m} />
        ))}
        {loading && <Loader label="AI is typing" />}
        <div ref={endRef} />
      </div>
      <ChatInput onSend={send} disabled={loading} />
    </section>
  )
}
