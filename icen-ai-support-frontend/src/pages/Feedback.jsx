import React from 'react'
import FeedbackForm from '../components/FeedbackForm'
import { useChatStore } from '../store/useChatStore'
import { supabase } from '../utils/supabaseClient'

export default function Feedback() {
  const { sessionId } = useChatStore()

  async function submitFeedback({ rating, comment }) {
    await supabase.from('feedback').insert({ session_id: sessionId, rating, comment })
    alert('Thanks for your feedback!')
  }

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold mb-3">Rate your last interaction</h2>
      {!sessionId && <div className="text-sm text-gray-600 mb-3">No active session; feedback will be general.</div>}
      <FeedbackForm onSubmit={submitFeedback} />
    </div>
  )
}
