// Project service - handles all project operations
import { supabase } from '@/integrations/supabase/client';
import { Project, CreateProjectInput, UpdateProjectInput } from '../types/project.types';

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.`;

const mapProject = (data: {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}): Project => ({
  id: data.id,
  name: data.name,
  description: data.description || undefined,
  systemPrompt: data.system_prompt,
  userId: data.user_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapProject);
  },

  async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: input.name,
        description: input.description || null,
        system_prompt: input.systemPrompt || DEFAULT_SYSTEM_PROMPT,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return mapProject(data);
  },

  async updateProject(projectId: string, updates: UpdateProjectInput): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        system_prompt: updates.systemPrompt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) throw error;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },
};
