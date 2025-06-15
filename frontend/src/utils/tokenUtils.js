// Import jwt-decode with proper error handling
let jwtDecode;
try {
  jwtDecode = require('jwt-decode').default;
} catch (error) {
  console.error('Error importing jwt-decode:', error);
  // Fallback implementation
  jwtDecode = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return { exp: 0 };
    }
  };
}

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