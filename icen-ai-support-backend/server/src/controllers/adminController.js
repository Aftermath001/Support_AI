import getSupabaseClient from '../../../src/db.js'

/**
 * Gather basic admin metrics: total chat sessions, top FAQ tags, average AI response time, average feedback
 */
export async function getAdminStats(_req, res) {
  try {
    const supabase = getSupabaseClient()

    // total chats
    const { data: sessions, error: sErr } = await supabase.from('chat_sessions').select('id')
    if (sErr) throw sErr

    // feedback ratings
    const { data: feedbacks, error: fErr } = await supabase.from('feedback').select('rating')
    if (fErr) throw fErr

    // faqs tags
    const { data: faqs, error: qErr } = await supabase.from('faqs').select('tags')
    if (qErr) throw qErr

    const tagCounts = {}
    for (const f of faqs ?? []) {
      const tags = (f.tags || '').split(',').map(t => t.trim()).filter(Boolean)
      for (const t of tags) tagCounts[t] = (tagCounts[t] || 0) + 1
    }

    // average AI response time (best-effort): fetch recent chats and compute diffs between user->ai
    const { data: chats } = await supabase
      .from('chats')
      .select('id,session_id,sender,created_at')
      .order('created_at', { ascending: true })
      .limit(500)

    let totalDiff = 0
    let count = 0
    const bySession = {}
    for (const c of chats || []) {
      if (!bySession[c.session_id]) bySession[c.session_id] = []
      bySession[c.session_id].push(c)
    }
    for (const arr of Object.values(bySession)) {
      for (let i = 1; i < arr.length; i++) {
        const prev = arr[i - 1]
        const cur = arr[i]
        if (prev.sender === 'user' && cur.sender === 'ai') {
          const diff = new Date(cur.created_at) - new Date(prev.created_at)
          if (!Number.isNaN(diff) && diff >= 0) { totalDiff += diff; count++ }
        }
      }
    }

    const avgResponseMs = count ? Math.round(totalDiff / count) : null

    const avgRating = feedbacks?.length ? (feedbacks.reduce((a, b) => a + (b.rating || 0), 0) / feedbacks.length) : null

    return res.json({
      ok: true,
      totalChats: sessions?.length ?? 0,
      topTags: Object.entries(tagCounts).map(([name, value]) => ({ name, value })),
      avgResponseMs,
      avgRating,
    })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Failed to compute admin stats', error: e.message })
  }
}
