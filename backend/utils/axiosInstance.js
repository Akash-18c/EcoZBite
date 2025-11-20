const axios = require('axios');

// Create axios instance for external AI service
const axiosInstance = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds for AI service calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios Instance Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

module.exports = axiosInstance;
