import { supabase } from '../../server.js'

export async function signup(req, res) {
  try {
    const { email, password, name, role = 'user' } = req.body
    if (!email || !password) return res.status(400).json({ ok: false, message: 'email and password required' })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: process.env.SUPABASE_EMAIL_REDIRECT || undefined,
      },
    })
    if (error) return res.status(400).json({ ok: false, message: error.message })
    return res.json({ ok: true, user: data.user, session: data.session })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Signup error', error: e.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ ok: false, message: 'email and password required' })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return res.status(400).json({ ok: false, message: error.message })
    return res.json({ ok: true, user: data.user, session: data.session, access_token: data.session?.access_token })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Login error', error: e.message })
  }
}

export async function logout(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    // Note: supabase-js server client does not manage per-request sessions; client-side should remove token.
    // We can attempt to signOut but requires a refresh token; instead respond OK for stateless logout.
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Logout error', error: e.message })
  }
}
