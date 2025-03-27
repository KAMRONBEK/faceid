import { fetchBaseQuery, createApi, FetchBaseQueryError, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { RootState, AppStore } from '../store';
import { UserInfo } from '../types/models';

const baseQuery = fetchBaseQuery({ 
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Get state and safely access token
    const state = getState();
    // @ts-ignore - Accessing auth.userInfo which is defined in AppStore
    const userInfo = state.auth?.userInfo;
    const token = userInfo?.token;
    
    // If not in Redux store, check localStorage as fallback
    if (!token) {
      try {
        const userInfoString = localStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString) as UserInfo;
          if (userInfo && userInfo.token) {
            headers.set('Authorization', `Bearer ${userInfo.token}`);
            return headers;
          }
        }
      } catch (error) {
        console.error('Error parsing userInfo from localStorage:', error);
      }
    }
    
    // Set from Redux store if available
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Exam', 'Result', 'CheatingLog'],
  endpoints: () => ({}),
}); 