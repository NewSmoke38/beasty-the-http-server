import axios from 'axios';

// URLs from environment variables
const BEASTY_SERVER_URL = import.meta.env.VITE_BEASTY_SERVER_URL || 'http://localhost:8000';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'https://beasty-backend.onrender.com/api';

console.log('Backend API URL:', BACKEND_URL);
console.log('Beasty Server URL:', BEASTY_SERVER_URL);

// Axios instance for backend (Express/Mongo)
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios instance for Beasty server
const beastyApi = axios.create({
  baseURL: BEASTY_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for logging (optional, can be added to both if needed)
api.interceptors.request.use(request => {
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers
  });
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

// Auth API calls (for backend)
export const authAPI = {
  register: async (userData) => {
    console.log('authAPI.register called with:', userData);
    try {
      const response = await api.post('/v1/users/register', userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    console.log('authAPI.login called with:', credentials);
    try {
      const response = await api.post('/v1/users/login', credentials);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error.response?.data || error.message;
    }
  }
};

// Example usage for Beasty server:
// const response = await beastyApi.get('/beasty');

export { api, beastyApi };
export default api; 