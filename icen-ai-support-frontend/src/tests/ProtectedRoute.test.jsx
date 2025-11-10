import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ProtectedRoute from '../components/ProtectedRoute'
import * as auth from '../hooks/useAuth'

// Mock useAuth hook
vi.mock('../hooks/useAuth')

describe('ProtectedRoute', () => {
  const MockComponent = () => <div>Protected Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while auth is being checked', () => {
    auth.default.mockReturnValue({ loading: true })
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </BrowserRouter>
    )
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    auth.default.mockReturnValue({ loading: false, user: null })
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </BrowserRouter>
    )
    expect(window.location.pathname).toBe('/login')
  })

  it('renders children when user is authenticated', () => {
    auth.default.mockReturnValue({
      loading: false,
      user: { email: 'user@example.com' },
      role: 'user'
    })
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </BrowserRouter>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('blocks non-admin users from admin routes', () => {
    auth.default.mockReturnValue({
      loading: false,
      user: { email: 'user@example.com' },
      role: 'user'
    })
    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin>
          <MockComponent />
        </ProtectedRoute>
      </BrowserRouter>
    )
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
  })

  it('allows admin users to access admin routes', () => {
    auth.default.mockReturnValue({
      loading: false,
      user: { email: 'admin@example.com' },
      role: 'admin'
    })
    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin>
          <MockComponent />
        </ProtectedRoute>
      </BrowserRouter>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})