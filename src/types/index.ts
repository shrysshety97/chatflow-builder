export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  projectId: string;
  attachments?: FileAttachment[];
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  projectId: string;
  messages: Message[];
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
