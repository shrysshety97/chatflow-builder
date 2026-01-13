import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileAttachment } from '@/types';
import { toast } from 'sonner';

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

export const useFileUpload = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 10MB.`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported.`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(data.path);

      setUploadProgress(100);

      return {
        id: data.path,
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size,
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user, validateFile]);

  const uploadFiles = useCallback(async (files: File[]): Promise<FileAttachment[]> => {
    const attachments: FileAttachment[] = [];
    
    for (const file of files) {
      const attachment = await uploadFile(file);
      if (attachment) {
        attachments.push(attachment);
      }
    }
    
    return attachments;
  }, [uploadFile]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('chat-attachments')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }, []);

  return {
    uploadFile,
    uploadFiles,
    deleteFile,
    isUploading,
    uploadProgress,
    validateFile,
  };
};
