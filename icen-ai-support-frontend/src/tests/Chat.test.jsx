import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Chat from '../pages/Chat'
import { useChatStore } from '../store/useChatStore'

vi.mock('../utils/supabaseClient', () => ({
  supabase: {
    from: () => ({ insert: () => ({ error: null }), select: () => ({ single: () => ({ data: { id: 'test' }, error: null }) }) }),
    functions: { invoke: async () => ({ data: { reply: 'Hello from AI' } }) },
  }
}))

function Wrapper({ children }) { return <BrowserRouter>{children}</BrowserRouter> }

test('renders and sends a message', async () => {
  const { container } = render(<Chat />, { wrapper: Wrapper })
  const input = screen.getByLabelText('Message')
  fireEvent.change(input, { target: { value: 'Hi' } })
  fireEvent.submit(input.closest('form'))
  // user message present
  expect(container.textContent).toContain('Hi')
})
