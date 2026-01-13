import React from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-gradient-primary" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-foreground" />
        )}
      </div>
      
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isUser 
            ? "bg-chat-user text-chat-user-foreground rounded-tr-md" 
            : "bg-chat-assistant text-chat-assistant-foreground rounded-tl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <p className={cn(
          "text-[10px] mt-1.5",
          isUser ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};
