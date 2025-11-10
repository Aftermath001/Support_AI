import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase.from('faqs').select('*').order('id')
      setFaqs(data ?? [])
    }
    fetchFaqs()
  }, [])

  const filtered = faqs.filter(f => f.question.toLowerCase().includes(query.toLowerCase()) || f.answer.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="search" className="block text-sm font-medium">Search FAQs</label>
        <input id="search" className="w-full border rounded-md px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by keyword..." />
      </div>
      <ul className="space-y-3">
        {filtered.map((f) => (
          <li key={f.id} className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-semibold text-primary">{f.question}</h3>
            <p className="text-gray-700 mt-1">{f.answer}</p>
            {f.tags && <div className="text-xs text-gray-500 mt-2">Tags: {f.tags}</div>}
          </li>
        ))}
        {filtered.length === 0 && <div className="text-gray-600">No FAQs found.</div>}
      </ul>
    </div>
  )
}
