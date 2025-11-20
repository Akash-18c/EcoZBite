import axios from 'axios';
import toast from 'react-hot-toast';

export const safeApiCall = async (apiCall, options = {}) => {
  const {
    defaultValue = null,
    showError = true,
    errorMessage = 'An error occurred',
    retries = 0,
    retryDelay = 1000
  } = options;

  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      const result = await apiCall();
      return { success: true, data: result, error: null };
    } catch (error) {
      attempt++;
      
      if (attempt <= retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      console.error('API call failed:', error);
      
      if (showError) {
        const message = error?.response?.data?.message || errorMessage;
        toast.error(message);
      }
      
      return { 
        success: false, 
        data: defaultValue, 
        error: error?.response?.data?.message || error?.message || errorMessage 
      };
    }
  }
};

export const createSafeApiCall = (baseURL = 'http://localhost:4000/api') => {
  const api = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
};