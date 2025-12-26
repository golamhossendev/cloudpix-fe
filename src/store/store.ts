import { configureStore } from '@reduxjs/toolkit';
import { filesApi } from './api/filesApi';

export const store = configureStore({
  reducer: {
    [filesApi.reducerPath]: filesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(filesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

