// Chat feature barrel export
export { ChatMessage } from './components/ChatMessage';
export { ChatInput } from './components/ChatInput';
export { FilePreview } from './components/FilePreview';
export { useChat } from './hooks/useChat';
export { useFileUpload } from './hooks/useFileUpload';
export { messageService } from './services/message.service';
export { aiService } from './services/ai.service';
export { fileService } from './services/file.service';
export type { Message, FileAttachment, ChatSession, SendMessageInput, ChatMessage as ChatMessageType } from './types/chat.types';
