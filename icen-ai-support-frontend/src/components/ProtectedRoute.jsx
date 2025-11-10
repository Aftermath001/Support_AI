import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loader from './Loader'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <div className="p-4"><Loader /></div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && role !== 'admin') {
    return (
      <div className="p-4">
        <div className="text-red-600">Unauthorized: admin access required</div>
      </div>
    )
  }

  return children
}