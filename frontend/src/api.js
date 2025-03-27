import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use((config) => {
  const userInfoString = localStorage.getItem('userInfo');
  
  if (userInfoString) {
    try {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch (error) {
      console.error('Error parsing userInfo from localStorage:', error);
    }
  }
  
  return config;
});
export default api;