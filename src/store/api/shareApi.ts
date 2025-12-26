import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface ShareLink {
  linkId: string;
  fileId: string;
  userId: string;
  createdDate: string;
  expiryDate: string;
  isRevoked: boolean;
  accessCount: number;
  shareUrl?: string; // Public share URL
}

export interface CreateShareLinkRequest {
  expirationDays?: number;
}

export interface CreateShareLinkResponse extends ShareLink {
  shareUrl: string;
}

export interface FileByShareLink {
  file: {
    fileId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    blobUrl: string;
    uploadDate: string;
  };
  shareLink: ShareLink;
  downloadUrl: string; // SAS URL for blob access
}

export interface ShareLinksResponse {
  shareLinks: ShareLink[];
}

export const shareApi = createApi({
  reducerPath: 'shareApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ShareLink'],
  endpoints: (builder) => ({
    createShareLink: builder.mutation<CreateShareLinkResponse, { fileId: string; expirationDays?: number }>({
      query: ({ fileId, expirationDays }) => ({
        url: `/files/${fileId}/share`,
        method: 'POST',
        body: expirationDays ? { expirationDays } : {},
      }),
      invalidatesTags: ['ShareLink'],
    }),
    revokeShareLink: builder.mutation<{ message: string }, string>({
      query: (linkId) => ({
        url: `/share/${linkId}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: ['ShareLink'],
    }),
    getFileByShareLink: builder.query<FileByShareLink, string>({
      query: (linkId) => ({
        url: `/share/${linkId}`,
        // This endpoint doesn't require auth on backend, so baseQueryWithReauth will work
        // but won't fail if no token is present
      }),
      providesTags: (_result, _error, linkId) => [{ type: 'ShareLink', id: linkId }],
    }),
    getShareLinksByFileId: builder.query<ShareLinksResponse, string>({
      query: (fileId) => `/files/${fileId}/share-links`,
      providesTags: (_result, _error, fileId) => [{ type: 'ShareLink', id: fileId }],
    }),
  }),
});

export const {
  useCreateShareLinkMutation,
  useRevokeShareLinkMutation,
  useGetFileByShareLinkQuery,
  useGetShareLinksByFileIdQuery,
} = shareApi;

