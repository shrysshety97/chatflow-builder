import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useProjects } from '@/contexts/ProjectContext';
import { MessageSquare, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ChatWindowProps {
  onOpenSettings: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onOpenSettings }) => {
  const { currentProject, messages, addMessage, clearMessages } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!currentProject) return;

    // Add user message
    addMessage({
      role: 'user',
      content,
      projectId: currentProject.id,
    });

    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI response
    const responses = [
      "I understand your question. Let me help you with that.",
      "That's an interesting point. Based on my analysis...",
      "I'd be happy to assist you with this. Here's what I think...",
      "Great question! Here's my response based on my training...",
    ];
    
    addMessage({
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)] + 
        " This is a demo response. Connect an LLM API for real responses.",
      projectId: currentProject.id,
    });

    setIsLoading(false);
  };

  const handleClearChat = () => {
    clearMessages();
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
            disabled={messages.length === 0}
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
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
