import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, ChatInput, useChat } from '@/features/chat';
import { useProjects } from '@/features/projects';
import { MessageSquare, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { FileAttachment } from '@/features/chat/types/chat.types';

interface ChatWindowProps { onOpenSettings: () => void; }

export const ChatWindow: React.FC<ChatWindowProps> = ({ onOpenSettings }) => {
  const { currentProject, messages, addMessage, updateMessage, clearMessages } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { streamChat, isStreaming } = useChat({ systemPrompt: currentProject?.systemPrompt, onError: (e) => toast.error(e.message) });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!currentProject) return;
    const userMsg = await addMessage({ role: 'user', content, projectId: currentProject.id, attachments });
    if (!userMsg) return;
    setIsLoading(true);
    const assistantMsg = await addMessage({ role: 'assistant', content: '', projectId: currentProject.id });
    if (!assistantMsg) { setIsLoading(false); return; }
    setStreamingMessageId(assistantMsg.id);
    let full = '';
    try {
      const chatHistory = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      await streamChat({ messages: [...chatHistory, { role: 'user', content }], onDelta: (c) => { full += c; updateMessage(assistantMsg.id, full); }, onDone: () => { setStreamingMessageId(null); setIsLoading(false); } });
    } catch { updateMessage(assistantMsg.id, 'Error occurred.'); setStreamingMessageId(null); setIsLoading(false); }
  };

  if (!currentProject) return <div className="flex-1 flex items-center justify-center bg-gradient-glow"><div className="text-center"><MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" /><h2 className="text-xl font-semibold">Select a Project</h2></div></div>;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center"><MessageSquare className="h-5 w-5 text-primary-foreground" /></div><div><h2 className="font-semibold">{currentProject.name}</h2><p className="text-xs text-muted-foreground">{messages.length} messages</p></div></div>
        <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => { clearMessages(); toast.success('Chat cleared'); }} disabled={!messages.length || isLoading}><Trash2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={onOpenSettings}><Settings className="h-4 w-4" /></Button></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">{messages.length === 0 ? <div className="flex items-center justify-center h-full text-muted-foreground">Start a conversation</div> : messages.map(m => <ChatMessage key={m.id} message={m} isStreaming={m.id === streamingMessageId} />)}<div ref={messagesEndRef} /></div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isStreaming} />
    </div>
  );
};
