import React from 'react'

export default function Loader({ label = 'Loading' }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-gray-600">
      <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay: '0ms'}} />
      <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay: '150ms'}} />
      <span className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay: '300ms'}} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
