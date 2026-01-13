import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Project, Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  messages: Message[];
  isLoading: boolean;
  createProject: (name: string, description?: string, systemPrompt?: string) => Promise<Project>;
  selectProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<Message | null>;
  updateMessage: (messageId: string, content: string) => void;
  clearMessages: () => void;
  loadMessages: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.`;

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setMessages([]);
    }
  }, [isAuthenticated, user]);

  const loadProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: Project[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        systemPrompt: p.system_prompt,
        userId: p.user_id,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedMessages: Message[] = (data || []).map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        projectId: m.project_id,
        createdAt: new Date(m.created_at),
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load chat history');
    }
  }, []);

  const createProject = useCallback(async (name: string, description?: string, systemPrompt?: string): Promise<Project> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description: description || null,
          system_prompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        systemPrompt: data.system_prompt,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setCurrentProject(project || null);
    if (project) {
      loadMessages(projectId);
    } else {
      setMessages([]);
    }
  }, [projects, loadMessages]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
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

      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
      ));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  }, [currentProject]);

  const addMessage = useCallback(async (message: Omit<Message, 'id' | 'createdAt'>): Promise<Message | null> => {
    if (!user || !currentProject) return null;

    try {
      // First create a chat session if needed
      let sessionId: string;
      
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('project_id', currentProject.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        sessionId = existingSession.id;
      } else {
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            project_id: currentProject.id,
            user_id: user.id,
            title: 'Chat Session',
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        sessionId = newSession.id;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          project_id: message.projectId,
          user_id: user.id,
          role: message.role,
          content: message.content,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: Message = {
        id: data.id,
        role: data.role as 'user' | 'assistant',
        content: data.content,
        projectId: data.project_id,
        createdAt: new Date(data.created_at),
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Failed to add message:', error);
      toast.error('Failed to save message');
      return null;
    }
  }, [user, currentProject]);

  const updateMessage = useCallback((messageId: string, content: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, content } : m
    ));
  }, []);

  const clearMessages = useCallback(async () => {
    if (!currentProject || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('project_id', currentProject.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);
    } catch (error) {
      console.error('Failed to clear messages:', error);
      toast.error('Failed to clear chat');
    }
  }, [currentProject, user]);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      messages,
      isLoading,
      createProject,
      selectProject,
      updateProject,
      deleteProject,
      addMessage,
      updateMessage,
      clearMessages,
      loadMessages,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
