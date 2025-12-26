export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  thumbnail?: string;
  uploadDate: string;
  isShared: boolean;
  shareCount: number;
  downloads: number;
  tags?: string[];
}

export interface User {
  name: string;
  email: string;
  storageLimit: number;
  storageUsed: number;
}

export interface UploadFileItem {
  file: globalThis.File;
  id: string;
  progress: number;
}

export interface ShareSettings {
  expiration: '1d' | '7d' | '30d' | 'never';
  privacy: 'public' | 'private' | 'password';
  maxViews: number;
  password?: string;
}

export interface AppState {
  currentPage: string;
  files: File[];
  selectedFiles: UploadFile[];
  uploadProgress: Record<string, number>;
  user: User;
}

