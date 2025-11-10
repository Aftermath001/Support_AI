import getSupabaseClient from '../db.js';

/**
 * Insert a user message into chats table
 * @param {string} userId
 * @param {string} text
 * @param {object} metadata
 */
export async function saveUserMessage(userId, text, metadata = {}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, message: text, sender: 'user', metadata })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Insert an AI message into chats table
 * @param {string} userId
 * @param {string} text
 * @param {object} metadata
 */
export async function saveAIMessage(userId, text, metadata = {}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, message: text, sender: 'ai', metadata })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get recent chat messages for a user
 * @param {string} userId
 * @param {number} limit
 */
export async function getRecentChats(userId, limit = 4) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chats')
    .select('id, message, sender, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).reverse();
}

export default { saveUserMessage, saveAIMessage, getRecentChats };
