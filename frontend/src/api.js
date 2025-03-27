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
  
  // Add retry configuration to each request
  config.retry = 3; // Number of retry attempts
  config.retryDelay = 1000; // Delay between retries in ms
  
  return config;
});

// Response interceptor for handling retries
api.interceptors.response.use(null, async (error) => {
  const { config } = error;
  
  // If config does not exist or the retry option is not set, reject
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  
  // Set the variable for tracking retry count
  config.__retryCount = config.__retryCount || 0;
  
  // Check if we've maxed out the total number of retries
  if (config.__retryCount >= config.retry) {
    // Reject with the error
    return Promise.reject(error);
  }
  
  // Increase the retry count
  config.__retryCount += 1;
  
  // Create new promise to handle retry delay
  const backoff = new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Retrying request (${config.__retryCount}/${config.retry}): ${config.url}`);
      resolve();
    }, config.retryDelay || 1000);
  });
  
  // Return the promise in which recalls axios to retry the request
  await backoff;
  return api(config);
});

export default api;