import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface ShareLink {
  linkId: string;
  fileId: string;
  userId: string;
  createdAt: string;
  expiresAt?: string;
  isRevoked: boolean;
  accessCount: number;
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
      query: (linkId) => `/share/${linkId}`,
      providesTags: (result, error, linkId) => [{ type: 'ShareLink', id: linkId }],
    }),
  }),
});

export const {
  useCreateShareLinkMutation,
  useRevokeShareLinkMutation,
  useGetFileByShareLinkQuery,
} = shareApi;

