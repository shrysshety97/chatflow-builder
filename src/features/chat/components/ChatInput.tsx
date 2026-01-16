// Chat input component
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileAttachment } from '../types/chat.types';
import { useFileUpload } from '../hooks/useFileUpload';
import { FilePreview } from './FilePreview';
import { useAuth } from '@/features/auth';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  disabled = false 
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, isUploading } = useFileUpload(user?.id);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !isLoading && !disabled && !isUploading) {
      onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploaded = await uploadFiles(Array.from(files));
    setAttachments(prev => [...prev, ...uploaded]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map(attachment => (
            <FilePreview
              key={attachment.id}
              attachment={attachment}
              onRemove={() => handleRemoveAttachment(attachment.id)}
              compact
            />
          ))}
        </div>
      )}
      
      <div className={cn(
        "flex items-end gap-2 bg-secondary rounded-xl p-2 transition-all",
        "focus-within:ring-2 focus-within:ring-primary/50"
      )}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          type="button"
          className={cn(
            "p-2 text-muted-foreground hover:text-foreground transition-colors",
            isUploading && "animate-pulse"
          )}
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isUploading ? "Uploading files..." : "Type your message..."}
          className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-sm py-2 max-h-[200px] scrollbar-thin"
          rows={1}
          disabled={disabled || isLoading || isUploading}
        />
        
        <Button
          type="submit"
          variant="gradient"
          size="icon"
          disabled={(!message.trim() && attachments.length === 0) || isLoading || disabled || isUploading}
          className="h-10 w-10 rounded-lg flex-shrink-0"
        >
          {isLoading || isUploading ? (
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
