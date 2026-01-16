// Project context - manages project and message state
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Project } from '../types/project.types';
import { Message, FileAttachment } from '@/features/chat/types/chat.types';
import { projectService } from '../services/project.service';
import { messageService } from '@/features/chat/services/message.service';
import { useAuth } from '@/features/auth';
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

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = useCallback(async (projectId: string) => {
    try {
      const data = await messageService.getMessages(projectId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load chat history');
    }
  }, []);

  const createProject = useCallback(async (name: string, description?: string, systemPrompt?: string): Promise<Project> => {
    if (!user) throw new Error('User not authenticated');
    setIsLoading(true);
    try {
      const newProject = await projectService.createProject(user.id, { name, description, systemPrompt });
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setCurrentProject(project || null);
    if (project) loadMessages(projectId);
    else setMessages([]);
  }, [projects, loadMessages]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      await projectService.updateProject(projectId, updates);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p));
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
      await projectService.deleteProject(projectId);
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
      const sessionId = await messageService.getOrCreateSession(user.id, currentProject.id);
      const newMessage = await messageService.createMessage(
        user.id, message.projectId, sessionId, message.role, message.content, message.attachments
      );
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Failed to add message:', error);
      toast.error('Failed to save message');
      return null;
    }
  }, [user, currentProject]);

  const updateMessage = useCallback((messageId: string, content: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content } : m));
  }, []);

  const clearMessages = useCallback(async () => {
    if (!currentProject || !user) return;
    try {
      await messageService.clearMessages(user.id, currentProject.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear messages:', error);
      toast.error('Failed to clear chat');
    }
  }, [currentProject, user]);

  return (
    <ProjectContext.Provider value={{
      projects, currentProject, messages, isLoading,
      createProject, selectProject, updateProject, deleteProject,
      addMessage, updateMessage, clearMessages, loadMessages,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};
