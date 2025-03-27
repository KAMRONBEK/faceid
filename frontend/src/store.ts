import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import { apiSlice } from './slices/apiSlice';

// Define the store shape explicitly
export interface AppStore {
  auth: {
    userInfo: {
      token?: string;
      user?: {
        _id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        isTeacher: boolean;
      }
    } | null;
  };
  [key: string]: any; // To accommodate the dynamically added apiSlice reducer
}

const store = configureStore({
  reducer: {
    auth: authSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 