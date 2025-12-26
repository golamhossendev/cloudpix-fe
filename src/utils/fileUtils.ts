export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType === 'application/pdf') return '📄';
  return '📁';
};

export const getFileThumbnail = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Image';
  }
  if (mimeType.startsWith('video/')) {
    return 'https://via.placeholder.com/300x200/50E3C2/FFFFFF?text=Video';
  }
  return 'https://via.placeholder.com/300x200/9013FE/FFFFFF?text=Document';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (file: globalThis.File): boolean => {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'application/pdf'
  ];
  return validTypes.includes(file.type);
};

export const isValidFileSize = (file: globalThis.File, maxSizeMB: number = 100): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

import { format } from 'date-fns';
import type { File } from '../types';

// Helper to normalize file data from API to consistent format
export const normalizeFile = (file: any): File => {
  // Handle date conversion - backend may send Date object or ISO string
  let uploadDate: string;
  if (file.uploadDate instanceof Date) {
    uploadDate = format(file.uploadDate, 'yyyy-MM-dd');
  } else if (typeof file.uploadDate === 'string') {
    uploadDate = format(new Date(file.uploadDate), 'yyyy-MM-dd');
  } else {
    uploadDate = format(new Date(), 'yyyy-MM-dd');
  }

  // Generate thumbnail URL - use blobUrl for images, placeholder for others
  let thumbnail: string;
  if (file.contentType?.startsWith('image/') && file.blobUrl) {
    thumbnail = file.blobUrl;
  } else {
    thumbnail = getFileThumbnail(file.contentType || file.type || '');
  }

  return {
    id: file.fileId || file.id || '',
    fileId: file.fileId || file.id || '',
    name: file.fileName || file.name || '',
    fileName: file.fileName || file.name || '',
    type: file.contentType || file.type || '',
    contentType: file.contentType || file.type || '',
    size: file.fileSize || file.size || 0,
    fileSize: file.fileSize || file.size || 0,
    thumbnail,
    blobUrl: file.blobUrl || '',
    uploadDate,
    isShared: file.isShared || false,
    shareCount: file.shareCount || 0,
    downloads: file.downloads || 0,
    tags: file.tags || [],
    userId: file.userId,
  };
};

