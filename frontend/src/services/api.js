import axios from 'axios';

const BEASTY_SERVER_URL = 'https://beasty-server.onrender.com';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'https://beasty-backend.onrender.com';

console.log('Backend API URL:', BACKEND_URL);
console.log('Beasty Server URL:', BEASTY_SERVER_URL);

// Axios instance for backend /Mongo)
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
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

api.interceptors.request.use(request => {
  console.log('API Request Details:', {
    fullUrl: `${request.baseURL}${request.url}`,
    baseURL: request.baseURL,
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

// Add interceptors for Beasty API
beastyApi.interceptors.request.use(request => {
  console.log('Beasty Request Details:', {
    fullUrl: `${request.baseURL}${request.url}`,
    baseURL: request.baseURL,
    url: request.url,
    method: request.method,
    headers: request.headers
  });
  return request;
});

beastyApi.interceptors.response.use(
  response => {
    console.log('Beasty Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Beasty Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    console.log('authAPI.register called with:', userData);
    try {
      console.log('Making registration request to:', `${api.defaults.baseURL}/v1/users/register`);
      const response = await api.post('/v1/users/register', userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
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

beastyApi.ping = async (token) => {
  try {
    const response = await beastyApi.get('/api/v1/beasty/ping', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Beasty ping failed:', error);
    throw error.response?.data || error.message;
  }
};

export { api, beastyApi };
export default api; 