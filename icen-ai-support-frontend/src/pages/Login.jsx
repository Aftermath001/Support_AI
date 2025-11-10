import React, { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/chat')
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/chat')
  }

  async function handleReset() {
    if (!email) return setError('Enter email for reset link')
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' })
    if (error) setError(error.message)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm mt-8">
      <h1 className="text-2xl font-semibold mb-4 text-primary">Sign in to ICEN</h1>
      {error && <div role="alert" className="mb-3 text-red-600">{error}</div>}
      <form className="space-y-3" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">Sign In</button>
          <button onClick={handleSignup} disabled={loading} className="px-4 py-2 bg-accent text-white rounded-md disabled:opacity-50" aria-label="Sign up">Sign Up</button>
          <button type="button" onClick={handleReset} className="text-sm text-primary underline ml-auto">Reset password</button>
        </div>
      </form>
    </div>
  )
}
