import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'

vi.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
    }
  }
}))

function Wrapper({ children }) { return <BrowserRouter>{children}</BrowserRouter> }

test('login form renders and can submit', async () => {
  render(<Login />, { wrapper: Wrapper })
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
  fireEvent.submit(screen.getByText(/sign in/i).closest('form'))
  expect(screen.getByText(/sign up/i)).toBeInTheDocument()
})
