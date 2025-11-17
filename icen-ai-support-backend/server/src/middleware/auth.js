import { supabase } from '../../server.js'

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ ok: false, message: 'Missing bearer token' })
  req.userToken = token
  next()
}

export async function getUserFromToken(req, res, next) {
  try {
    const { data, error } = await supabase.auth.getUser(req.userToken)
    if (error || !data?.user) return res.status(401).json({ ok: false, message: 'Invalid session' })
    if (!data.user.user_metadata.role) data.user.user_metadata.role = 'user'
    req.user = data.user
    next()
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Auth error', error: e.message })
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const role = req?.user?.user_metadata?.role || 'user'
    if (!roles.includes(role)) return res.status(403).json({ ok: false, message: 'Forbidden' })
    next()
  }
}
