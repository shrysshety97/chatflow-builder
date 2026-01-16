// File upload service - handles file operations
import { supabase } from '@/integrations/supabase/client';
import { FileAttachment } from '../types/chat.types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const fileService = {
  validateFile(file: File): string | null {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 10MB.`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported.`;
    }
    return null;
  },

  async uploadFile(userId: string, file: File): Promise<FileAttachment> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(data.path);

    return {
      id: data.path,
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size,
    };
  },

  async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('chat-attachments')
      .remove([filePath]);

    if (error) throw error;
  },
};
