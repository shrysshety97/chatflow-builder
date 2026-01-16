// Custom hook for file upload operations
import { useState, useCallback } from 'react';
import { fileService } from '../services/file.service';
import { FileAttachment } from '../types/chat.types';
import { toast } from 'sonner';

export const useFileUpload = (userId: string | undefined) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
    if (!userId) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    const error = fileService.validateFile(file);
    if (error) {
      toast.error(error);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const attachment = await fileService.uploadFile(userId, file);
      setUploadProgress(100);
      return attachment;
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [userId]);

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
      await fileService.deleteFile(filePath);
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
    validateFile: fileService.validateFile,
  };
};
