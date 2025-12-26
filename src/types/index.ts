export interface File {
  fileId: string;
  id?: string; // For backward compatibility
  fileName: string;
  name?: string; // For backward compatibility
  contentType: string;
  type?: string; // For backward compatibility
  fileSize: number;
  size?: number; // For backward compatibility
  blobUrl?: string;
  thumbnail?: string;
  uploadDate: string;
  createdAt?: string;
  isShared?: boolean;
  shareCount?: number;
  downloads?: number;
  tags?: string[];
  userId?: string;
}

export interface User {
  userId: string;
  email: string;
  name?: string; // Optional for backward compatibility
  storageLimit?: number;
  storageUsed?: number;
}

export interface AuthResponse {
  token: string;
  user: {
    userId: string;
    email: string;
  };
}

export interface ShareLink {
  linkId: string;
  fileId: string;
  userId: string;
  createdAt: string;
  expiresAt?: string;
  isRevoked: boolean;
  accessCount: number;
  shareUrl?: string;
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
  selectedFiles: UploadFileItem[];
  uploadProgress: Record<string, number>;
  user: User;
}

