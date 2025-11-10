import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(user)
      setLoading(false)
      if (user) fetchRole(user.id)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchRole(session.user.id)
    })

    init()
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  async function fetchRole(userId) {
    // expects a 'users' table with id, role columns
    const { data, error } = await supabase.from('users').select('role').eq('id', userId).single()
    if (!error) setRole(data?.role ?? null)
  }

  return { user, role, loading }
}
