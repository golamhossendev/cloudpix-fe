import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { File } from '../../types';

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['File'],
  endpoints: (builder) => ({
    getFiles: builder.query<File[], void>({
      query: () => '/files',
      providesTags: ['File'],
    }),
    getFileById: builder.query<File, string>({
      query: (id) => `/files/${id}`,
      providesTags: (result, error, id) => [{ type: 'File', id }],
    }),
    uploadFile: builder.mutation<File, FormData>({
      query: (formData) => ({
        url: '/files/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['File'],
    }),
    deleteFile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File'],
    }),
    updateFileShare: builder.mutation<File, { id: string; isShared: boolean }>({
      query: ({ id, isShared }) => ({
        url: `/files/${id}/share`,
        method: 'PATCH',
        body: { isShared },
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
  useUpdateFileShareMutation,
} = filesApi;

