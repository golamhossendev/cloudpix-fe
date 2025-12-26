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

