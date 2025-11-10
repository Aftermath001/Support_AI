import React, { useEffect, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useChatStore } from '../store/useChatStore'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import Loader from '../components/Loader'

export default function Chat() {
  const { sessionId, setSessionId, messages, addMessage, clear, loading, setLoading, setError } = useChatStore()
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    // Create a session row if not exists
    if (!sessionId) {
      const create = async () => {
        const { data, error } = await supabase.from('chat_sessions').insert({}).select('id').single()
        if (!error) setSessionId(data.id)
      }
      create()
    }
  }, [sessionId, setSessionId])

  async function send(text) {
    const message = { role: 'user', content: text, created_at: new Date().toISOString(), session_id: sessionId }
    addMessage(message)
    setLoading(true)
    const { error: saveErr } = await supabase.from('messages').insert({ session_id: sessionId, role: 'user', content: text })
    if (saveErr) setError(saveErr.message)

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { session_id: sessionId, messages: [...messages, message] },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const aiMessage = { role: 'assistant', content: data?.reply ?? '', created_at: new Date().toISOString(), session_id: sessionId }
    addMessage(aiMessage)
    await supabase.from('messages').insert({ session_id: sessionId, role: 'assistant', content: aiMessage.content })
    setLoading(false)
  }

  function endSession() {
    clear()
  }

  return (
    <section className="grid grid-rows-[1fr_auto] h-[calc(100vh-120px)] gap-3">
      <div className="overflow-y-auto bg-white rounded-md p-4 shadow-sm" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-gray-600">Start a conversation with ICEN AI. Ask about FAQs, research topics, or support policies.</p>
        )}
        {messages.map((m, idx) => (
          <ChatMessage key={idx} message={m} />
        ))}
        {loading && <Loader label="AI is typing" />}
        <div ref={endRef} />
      </div>
      <div className="space-y-2">
        <ChatInput onSend={send} disabled={loading} />
        <div className="flex justify-between">
          <button onClick={endSession} className="text-sm text-primary underline">End Session</button>
          <span className="text-xs text-gray-500">{navigator.onLine ? 'Online' : 'Offline - messages will not send'}</span>
        </div>
      </div>
    </section>
  )
}
