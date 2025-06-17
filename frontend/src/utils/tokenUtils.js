import { jwtDecode } from 'jwt-decode';

// Checking if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true; // if we can't decode the token, consider it expired, sed
  }
};

// Clean up expired tokens from localStorage  /// very imp
export const cleanupExpiredTokens = () => {
  try {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      return true; 
    }
    return false; 
  } catch (error) {
    return false;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return 0;
  try {
    const decoded = jwtDecode(token);
return decoded.exp * 1000; 
  } catch (error) {
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
        return false;
    }
};

export const getDecodedToken = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        return jwtDecode(token);
    } catch (error) {
        return null;
    }
}; 