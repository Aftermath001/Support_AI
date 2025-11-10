import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function Admin() {
  const [stats, setStats] = useState({ totalChats: 0, avgRating: 0, tags: [] })

  useEffect(() => {
    const load = async () => {
      const { data: chats } = await supabase.from('chat_sessions').select('id')
      const { data: fb } = await supabase.from('feedback').select('rating')
      const { data: faqs } = await supabase.from('faqs').select('tags')
      const tagCounts = {}
      for (const f of faqs ?? []) {
        const tags = (f.tags || '').split(',').map(t => t.trim()).filter(Boolean)
        for (const t of tags) tagCounts[t] = (tagCounts[t] || 0) + 1
      }
      setStats({
        totalChats: chats?.length || 0,
        avgRating: fb?.length ? (fb.reduce((a, b) => a + (b.rating || 0), 0) / fb.length).toFixed(2) : 0,
        tags: Object.entries(tagCounts).map(([name, value]) => ({ name, value }))
      })
    }
    load()
  }, [])

  const COLORS = ['#2E7D32', '#66BB6A', '#A5D6A7', '#C8E6C9']

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="text-sm text-gray-600">Total Chats</div>
          <div className="text-3xl font-bold text-primary">{stats.totalChats}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-3xl font-bold text-primary">{stats.avgRating}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Top FAQ Tags</div>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.tags} dataKey="value" nameKey="name" label>
                  {stats.tags.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
