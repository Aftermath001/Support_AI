import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Admin from '../pages/Admin'
import * as auth from '../hooks/useAuth'
import * as api from '../utils/api'

// Mock modules
vi.mock('../hooks/useAuth')
vi.mock('../utils/api')

const mockStats = {
  totalChats: 100,
  avgRating: 4.5,
  avgResponseMs: 2500,
  topTags: [
    { name: 'billing', value: 30 },
    { name: 'technical', value: 25 },
    { name: 'general', value: 15 }
  ]
}

describe('Admin Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state when auth is loading', () => {
    auth.default.mockReturnValue({ loading: true })
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    auth.default.mockReturnValue({ loading: false, user: null })
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    )
    expect(window.location.pathname).toBe('/login')
  })

  it('shows unauthorized message for non-admin users', () => {
    auth.default.mockReturnValue({
      loading: false,
      user: { email: 'user@example.com' },
      role: 'user'
    })
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    )
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
  })

  it('displays admin dashboard with stats', async () => {
    auth.default.mockReturnValue({
      loading: false,
      user: { email: 'admin@example.com' },
      role: 'admin'
    })
    api.getAdminStats.mockResolvedValue(mockStats)

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument() // Total chats
      expect(screen.getByText('4.50 / 5')).toBeInTheDocument() // Avg rating
      expect(screen.getByText('2.50s')).toBeInTheDocument() // Avg response time
      expect(screen.getByText('billing')).toBeInTheDocument() // Top tag
    })
  })

  it('shows error state when API call fails', async () => {
    auth.default.mockReturnValue({
      loading: false,
      user: { email: 'admin@example.com' },
      role: 'admin'
    })
    api.getAdminStats.mockRejectedValue(new Error('Failed to fetch'))

    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument()
    })
  })
})