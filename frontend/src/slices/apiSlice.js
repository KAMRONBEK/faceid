import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ 
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include', // withCredentials o'rniga
  prepareHeaders: (headers, { getState }) => {
    // Check Redux store first
    const token = getState()?.auth?.userInfo?.token;
    
    // If not in Redux store, check localStorage as fallback
    if (!token) {
      try {
        const userInfoString = localStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
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
  tagTypes: ['User', 'Exam'], // Qo'shimcha tagTypes qo'shing
  endpoints: () => ({}),
});