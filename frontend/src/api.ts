import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { UserInfo } from './types/models';

// Get the API URL from environment variables
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '';

if (!API_BASE_URL) {
  console.warn('API_BASE_URL environment variable is not set. API calls may fail.');
}

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // This ensures cookies are sent with requests
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const userInfoString = localStorage.getItem('userInfo');
    
    if (userInfoString) {
      try {
        const userInfo: UserInfo = JSON.parse(userInfoString);
        if (userInfo && userInfo.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
      } catch (error) {
        console.error('Error parsing userInfo from localStorage:', error);
      }
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    // Handle errors globally here
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access - perhaps redirect to login
      console.error('Unauthorized access detected');
    }
    return Promise.reject(error);
  }
);

export default api; 