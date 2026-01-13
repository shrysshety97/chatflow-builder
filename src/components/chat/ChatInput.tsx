import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border">
      <div className={cn(
        "flex items-end gap-2 bg-secondary rounded-xl p-2 transition-all",
        "focus-within:ring-2 focus-within:ring-primary/50"
      )}>
        <button
          type="button"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-sm py-2 max-h-[200px] scrollbar-thin"
          rows={1}
          disabled={disabled || isLoading}
        />
        
        <Button
          type="submit"
          variant="gradient"
          size="icon"
          disabled={!message.trim() || isLoading || disabled}
          className="h-10 w-10 rounded-lg flex-shrink-0"
        >
          {isLoading ? (
            <Sparkles className="h-4 w-4 animate-pulse" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
};
