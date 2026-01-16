// File preview component
import React from 'react';
import { FileAttachment } from '../types/chat.types';
import { cn } from '@/lib/utils';
import { File, Image, FileText, X, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface FilePreviewProps {
  attachment: FileAttachment;
  onRemove?: () => void;
  compact?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FilePreview: React.FC<FilePreviewProps> = ({ 
  attachment, 
  onRemove,
  compact = false 
}) => {
  const isImage = attachment.type.startsWith('image/');
  const FileIcon = getFileIcon(attachment.type);

  if (isImage && !compact) {
    return (
      <div className="relative group inline-block">
        <a 
          href={attachment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-border hover:opacity-90 transition-opacity"
          />
        </a>
        {onRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 bg-secondary/50 rounded-lg p-2 border border-border",
      compact ? "max-w-[150px]" : "max-w-[250px]"
    )}>
      <div className="flex-shrink-0 h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
        <FileIcon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{attachment.name}</p>
        <p className="text-[10px] text-muted-foreground">{formatFileSize(attachment.size)}</p>
      </div>
      {onRemove ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      ) : (
        <a 
          href={attachment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
          >
            <Download className="h-3 w-3" />
          </Button>
        </a>
      )}
    </div>
  );
};
