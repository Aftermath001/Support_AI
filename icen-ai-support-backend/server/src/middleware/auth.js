import { supabase } from '../../server.js'

export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ ok: false, message: 'Missing bearer token' })
    req.userToken = token
    return next()
  } catch (e) {
    return res.status(401).json({ ok: false, message: 'Invalid token', error: e.message })
  }
}

export async function getUserFromToken(req, res, next) {
  try {
    const token = req.userToken
    if (!token) return res.status(401).json({ ok: false, message: 'Missing token' })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user)
      return res.status(401).json({ ok: false, message: 'Invalid session', error: error?.message })
    req.user = data.user
    next()
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Auth error', error: e.message })
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const role = req?.user?.user_metadata?.role || 'user'
    if (!roles.includes(role)) {
      return res.status(403).json({ ok: false, message: 'Forbidden' })
    }
    next()
  }
}
