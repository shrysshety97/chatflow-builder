// Message service - handles all message operations
import { supabase } from '@/integrations/supabase/client';
import { Message, FileAttachment } from '../types/chat.types';

const mapMessage = (data: {
  id: string;
  role: string;
  content: string;
  project_id: string;
  attachments: unknown;
  created_at: string;
}): Message => ({
  id: data.id,
  role: data.role as 'user' | 'assistant',
  content: data.content,
  projectId: data.project_id,
  attachments: (data.attachments as FileAttachment[] | null) || undefined,
  createdAt: new Date(data.created_at),
});

export const messageService = {
  async getMessages(projectId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapMessage);
  },

  async createMessage(
    userId: string,
    projectId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    attachments?: FileAttachment[]
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        project_id: projectId,
        user_id: userId,
        role,
        content,
        attachments: (attachments || []) as unknown as Record<string, unknown>[],
      } as never)
      .select()
      .single();

    if (error) throw error;
    return mapMessage(data);
  },

  async getOrCreateSession(userId: string, projectId: string): Promise<string> {
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      return existingSession.id;
    }

    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert({
        project_id: projectId,
        user_id: userId,
        title: 'Chat Session',
      })
      .select()
      .single();

    if (error) throw error;
    return newSession.id;
  },

  async clearMessages(userId: string, projectId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
