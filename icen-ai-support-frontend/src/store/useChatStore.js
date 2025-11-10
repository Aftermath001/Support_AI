import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  sessionId: null,
  messages: [],
  loading: false,
  error: null,
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (msg) => set({ messages: [...get().messages, msg] }),
  clear: () => set({ messages: [], sessionId: null }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
}))
