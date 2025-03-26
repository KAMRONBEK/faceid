import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ 
  baseUrl: 'http://localhost:5005',
  credentials: 'include', // withCredentials o'rniga
  prepareHeaders: (headers, { getState }) => {
    // Tokenni console'ga chiqaramiz
    const token = getState()?.auth?.userInfo?.token;
    console.log('Current token:', token); // Tokenni ko'rish uchun
    
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