import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // RTK Query automatically handles FormData and sets Content-Type with boundary
    // No need to manually set or remove Content-Type for multipart/form-data
    
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Token expired or invalid - clear auth state
    const { clearCredentials } = await import('../slices/authSlice');
    api.dispatch(clearCredentials());
    
    // Redirect to login (handled by ProtectedRoute component)
  }
  
  return result;
};

