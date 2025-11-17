import React, { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user') // default role
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // --- LOGIN ---
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)

      if (loginError) setError(loginError.message)
      else if (data.session) navigate('/chat')
      else setError('Login failed. Check your credentials.')
    } catch (err) {
      setLoading(false)
      setError('Unexpected error: ' + err.message)
    }
  }

  // --- SIGNUP ---
  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role } // store role in user_metadata
        }
      })
      setLoading(false)

      if (signupError) setError(signupError.message)
      else {
        alert('Signup successful! Please check your email to confirm.')
        navigate('/chat')
      }
    } catch (err) {
      setLoading(false)
      setError('Unexpected error: ' + err.message)
    }
  }

  // --- PASSWORD RESET ---
  async function handleReset() {
    if (!email) return setError('Enter your email to receive reset link')
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      })
      setLoading(false)

      if (resetError) setError(resetError.message)
      else alert('Password reset email sent!')
    } catch (err) {
      setLoading(false)
      setError('Unexpected error: ' + err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm mt-8">
      <h1 className="text-2xl font-semibold mb-4 text-primary">Sign in to ICEN</h1>
      {error && <div role="alert" className="mb-3 text-red-600">{error}</div>}
      <form className="space-y-3" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-md disabled:opacity-50"
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-primary underline ml-auto"
          >
            Reset password
          </button>
        </div>
      </form>
    </div>
  )
}
