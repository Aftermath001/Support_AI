import { supabase } from '../../server.js'

export async function getHealth(_req, res) {
  try {
    // Light touch to verify connectivity (RPC to auth or simple select)
    const { error } = await supabase.from('chat_sessions').select('id').limit(1)
    if (error) {
      return res.status(500).json({ ok: false, message: 'Supabase connection failed', error: error.message })
    }
    return res.json({ ok: true, message: 'Backend connected successfully' })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Unexpected error', error: e.message })
  }
}
