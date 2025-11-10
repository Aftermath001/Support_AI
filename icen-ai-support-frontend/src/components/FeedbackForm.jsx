import React, { useState } from 'react'

export default function FeedbackForm({ onSubmit, loading }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ rating, comment })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="rating" className="block text-sm font-medium">Rating</label>
        <input id="rating" type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full" />
        <div className="text-sm text-gray-600">{rating} / 5</div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium">Comment (optional)</label>
        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={3} />
      </div>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">Submit</button>
    </form>
  )
}
