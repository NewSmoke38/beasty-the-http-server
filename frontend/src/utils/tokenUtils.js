import { jwtDecode } from 'jwt-decode';

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If we can't decode the token, consider it expired
  }
};

// Clean up expired tokens from localStorage
export const cleanupExpiredTokens = () => {
  try {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      return true; // Token was cleaned up
    }
    return false; // No cleanup needed
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    return false;
  }
};

// Get token expiration time in milliseconds
export const getTokenExpirationTime = (token) => {
  if (!token) return 0;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return 0;
  }
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return false;
    }
};

export const getDecodedToken = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}; 