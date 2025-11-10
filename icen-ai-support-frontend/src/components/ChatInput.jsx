import React, { useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="w-full px-4 py-3 pr-12 rounded-lg border focus:ring-1 focus:ring-primary focus:border-primary resize-none"
        rows={2}
        disabled={disabled}
        aria-label="Message"
      />
      <button type="submit" disabled={disabled || !text.trim()} className="absolute right-2 bottom-3 p-2 text-primary hover:bg-primary/10 rounded-full disabled:opacity-50" aria-label="Send">
        <Send size={20} />
      </button>
    </form>
  )
}
