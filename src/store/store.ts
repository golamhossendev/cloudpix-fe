import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
// Use ES module import for Vite compatibility
import storage from "redux-persist/es/storage";
import { filesApi } from "./api/filesApi";
import { authApi } from "./api/authApi";
import { shareApi } from "./api/shareApi";
import authSlice from "./slices/authSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist the auth slice
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  [filesApi.reducerPath]: filesApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [shareApi.reducerPath]: shareApi.reducer,
});

const persistedRootReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(filesApi.middleware, authApi.middleware, shareApi.middleware),
  devTools: true,
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
