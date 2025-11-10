import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserCircle2, MessageSquare, HelpCircle, Star, ShieldCheck } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const { role, loading } = useAuth()

  const navLink = (to, label, Icon) => (
    <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent/20 transition ${location.pathname === to ? 'text-primary' : 'text-gray-700'}`}>
      <Icon size={18} />{label}
    </Link>
  )

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/chat" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary" aria-hidden />
          <span className="font-semibold text-lg">ICEN AI Support</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navLink('/chat', 'Chat', MessageSquare)}
          {navLink('/faq', 'FAQ', HelpCircle)}
          {navLink('/feedback', 'Feedback', Star)}
          {/* Show admin only when user role is admin */}
          {!loading && role === 'admin' && navLink('/admin', 'Admin', ShieldCheck)}
        </nav>
        <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
          <UserCircle2 size={18} /> Sign out
        </button>
      </div>
    </header>
  )
}
