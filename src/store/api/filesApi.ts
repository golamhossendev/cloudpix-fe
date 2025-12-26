import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { File } from '../../types';
import { normalizeFile } from '../../utils/fileUtils';

// Backend response types
interface BackendFile {
  fileId: string;
  userId: string;
  fileName: string;
  blobUrl: string;
  fileSize: number;
  contentType: string;
  uploadDate: string | Date;
  status: 'active' | 'deleted';
}

export interface FilesResponse {
  files: BackendFile[];
}

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['File'],
  endpoints: (builder) => ({
    getFiles: builder.query<{ files: File[] }, void>({
      query: () => '/files',
      providesTags: ['File'],
      transformResponse: (response: FilesResponse) => ({
        files: response.files.map(normalizeFile),
      }),
    }),
    getFileById: builder.query<File, string>({
      query: (id) => `/files/${id}`,
      providesTags: (result, error, id) => [{ type: 'File', id }],
      transformResponse: (response: BackendFile) => normalizeFile(response),
    }),
    uploadFile: builder.mutation<File, FormData>({
      query: (formData) => ({
        url: '/files/upload',
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      }),
      invalidatesTags: ['File'],
      transformResponse: (response: BackendFile) => normalizeFile(response),
    }),
    deleteFile: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File'],
    }),
  }),
});

export const {
  useGetFilesQuery,
  useGetFileByIdQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
} = filesApi;

