import { buildPrompt } from '../src/ai/promptBuilder.js';
import { jest } from '@jest/globals';

// Mock db client functions used by chatService by monkey-patching getSupabaseClient
import * as db from '../src/db.js';
import * as chatService from '../src/services/chatService.js';

// Simple in-memory table for chats
const chats = [];

jest.spyOn(db, 'default').mockImplementation(() => ({
  from: (table) => ({
    insert: (row) => ({
      select: () => ({
        single: () => {
          if (table !== 'chats') throw new Error('unexpected table');
          const newRow = { id: `${Math.random()}`, created_at: new Date().toISOString(), ...row };
          chats.push(newRow);
          return { data: newRow };
        },
      }),
    }),
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({ data: chats.filter((c) => c.user_id === 'u1').slice(-4).reverse() }),
        }),
      }),
    }),
  }),
}));

describe('promptBuilder', () => {
  test('builds prompt with FAQs and history', () => {
    const prompt = buildPrompt({
      faqs: [
        { question: 'How to reset password?', answer: 'Use the reset link.' },
        { question: 'Billing cycles?', answer: 'Monthly.' },
      ],
      recentChats: [
        { sender: 'user', message: 'Hello' },
        { sender: 'ai', message: 'Hi, how can I help?' },
      ],
      userProfile: { name: 'Test', email: 't@example.com', role: 'admin' },
    });
    expect(prompt).toContain('ICEN AI Support Agent');
    expect(prompt).toContain('FAQ 1: Q: How to reset password?');
    expect(prompt).toContain('USER: Hello');
  });
});

describe('chatService', () => {
  test('save and get recent chats', async () => {
    await chatService.saveUserMessage('u1', 'Hi');
    await chatService.saveAIMessage('u1', 'Hello');
    const recent = await chatService.getRecentChats('u1', 4);
    expect(recent.length).toBeGreaterThanOrEqual(2);
    expect(recent[0].sender).toBe('user');
    expect(recent[1].sender).toBe('ai');
  });
});
