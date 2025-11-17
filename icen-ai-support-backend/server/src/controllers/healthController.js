import { supabase } from '../../server.js'

export async function getHealth(_req, res) {
  try {
    // Simple connectivity check: try fetching 1 user
    const { data, error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      return res.status(500).json({ ok: false, message: 'Supabase connection failed', error: error.message })
    }

    return res.json({ ok: true, message: 'Backend connected successfully', sample: data })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Unexpected error', error: e.message })
  }
}
