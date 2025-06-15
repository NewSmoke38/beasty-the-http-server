import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1/users';
console.log('API URL:', API_URL); 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Auth API calls (real bosses)
export const authAPI = {
  register: async (userData) => {
    console.log('authAPI.register called with:', userData);
    try {
      const response = await api.post('/register', userData);
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
      const response = await api.post('/login', credentials);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default api; 