import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useProjects } from '@/contexts/ProjectContext';
import { useChat } from '@/hooks/useChat';
import { MessageSquare, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileAttachment } from '@/types';

interface ChatWindowProps {
  onOpenSettings: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onOpenSettings }) => {
  const { currentProject, messages, addMessage, updateMessage, clearMessages } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { streamChat, isStreaming } = useChat({
    systemPrompt: currentProject?.systemPrompt,
    onError: (error) => {
      toast.error(error.message || 'Failed to get AI response');
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!currentProject) return;

    // Add user message to database with attachments
    const userMessage = await addMessage({
      role: 'user',
      content,
      projectId: currentProject.id,
      attachments,
    });

    if (!userMessage) {
      toast.error('Failed to send message');
      return;
    }

    setIsLoading(true);
    setStreamingContent('');

    // Create placeholder for assistant message
    const assistantMessage = await addMessage({
      role: 'assistant',
      content: '',
      projectId: currentProject.id,
    });

    if (!assistantMessage) {
      setIsLoading(false);
      return;
    }

    setStreamingMessageId(assistantMessage.id);

    let fullContent = '';

    try {
      // Build messages array for AI context (include attachment info in content)
      const chatHistory = messages.map(m => {
        let messageContent = m.content;
        if (m.attachments && m.attachments.length > 0) {
          const attachmentInfo = m.attachments.map(a => `[Attached: ${a.name}]`).join(' ');
          messageContent = attachmentInfo + (messageContent ? '\n' + messageContent : '');
        }
        return {
          role: m.role as 'user' | 'assistant',
          content: messageContent,
        };
      });

      // Add attachment info to current message
      let currentContent = content;
      if (attachments && attachments.length > 0) {
        const attachmentInfo = attachments.map(a => `[Attached: ${a.name}]`).join(' ');
        currentContent = attachmentInfo + (content ? '\n' + content : '');
      }

      await streamChat({
        messages: [...chatHistory, { role: 'user', content: currentContent }],
        onDelta: (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
          updateMessage(assistantMessage.id, fullContent);
        },
        onDone: () => {
          setStreamingContent('');
          setStreamingMessageId(null);
          setIsLoading(false);
        },
      });
    } catch (error) {
      // Update the message with error indicator
      updateMessage(assistantMessage.id, 'Sorry, I encountered an error. Please try again.');
      setStreamingContent('');
      setStreamingMessageId(null);
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    await clearMessages();
    toast.success('Chat cleared');
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-glow">
        <div className="text-center animate-fade-in">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Select a Project</h2>
          <p className="text-muted-foreground max-w-sm">
            Choose a project from the sidebar or create a new one to start chatting with your AI agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">{currentProject.name}</h2>
            <p className="text-xs text-muted-foreground">
              {messages.length} messages
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            disabled={messages.length === 0 || isLoading}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title="Project settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <p className="text-muted-foreground">
                Start a conversation with your AI agent
              </p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage 
              key={message.id} 
              message={message}
              isStreaming={message.id === streamingMessageId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isStreaming} />
    </div>
  );
};
