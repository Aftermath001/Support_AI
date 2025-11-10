import React from 'react'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm fade-in ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-white rounded-bl-none'}`}
        aria-label={isUser ? 'User message' : 'AI message'}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.created_at && (
          <span className="block mt-1 text-xs opacity-70">{new Date(message.created_at).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  )
}
