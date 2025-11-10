import React, { useState } from 'react'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="message" className="sr-only">Message</label>
      <input
        id="message"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="Ask ICEN AI..."
        disabled={disabled}
      />
      <button type="submit" disabled={disabled} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">Send</button>
    </form>
  )
}
