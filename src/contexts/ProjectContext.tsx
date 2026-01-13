import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, Message } from '@/types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  messages: Message[];
  isLoading: boolean;
  createProject: (name: string, description?: string, systemPrompt?: string) => Promise<Project>;
  selectProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  clearMessages: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.`;

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createProject = useCallback(async (name: string, description?: string, systemPrompt?: string): Promise<Project> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProjects(prev => [...prev, newProject]);
    setIsLoading(false);
    return newProject;
  }, []);

  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setCurrentProject(project || null);
    setMessages([]); // Clear messages when switching projects
  }, [projects]);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  }, [currentProject]);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      setMessages([]);
    }
  }, [currentProject]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

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
      clearMessages,
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
