// Chat feature types
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

export interface SendMessageInput {
  content: string;
  attachments?: FileAttachment[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
