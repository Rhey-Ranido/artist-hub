/**
 * Authentication utility functions
 * Helper functions for common auth operations
 */

/**
 * Check if a token is expired (basic check - doesn't verify signature)
 * @param {string} token - JWT token
 * @returns {boolean} - true if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

/**
 * Get user role from user data
 * @param {Object} user - User object
 * @returns {string} - User role
 */
export const getUserRole = (user) => {
  return user?.role || 'user';
};

/**
 * Check if user has specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean} - true if user has the role
 */
export const hasRole = (user, role) => {
  return getUserRole(user) === role;
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} - true if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is provider
 * @param {Object} user - User object
 * @returns {boolean} - true if user is provider
 */
export const isProvider = (user) => {
  return hasRole(user, 'provider');
};

/**
 * Get user display name
 * @param {Object} user - User object
 * @returns {string} - Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  return user.username || user.email || 'User';
};

/**
 * Get user profile image URL
 * @param {Object} user - User object
 * @returns {string|null} - Profile image URL or null
 */
export const getUserProfileImage = (user) => {
  return user?.profileImageUrl || user?.profileImage || null;
};

/**
 * Format user data for display
 * @param {Object} user - User object
 * @returns {Object} - Formatted user data
 */
export const formatUserForDisplay = (user) => {
  if (!user) return null;
  
  return {
    id: user._id || user.id,
    username: user.username,
    email: user.email,
    displayName: getUserDisplayName(user),
    profileImage: getUserProfileImage(user),
    role: getUserRole(user),
    isAdmin: isAdmin(user),
    isProvider: isProvider(user)
  };
};

/**
 * Create auth header for API requests
 * @param {string} token - JWT token
 * @returns {Object} - Authorization header object
 */
export const createAuthHeader = (token) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Handle auth errors (token expiry, etc.)
 * @param {Error} error - Error object
 * @param {Function} logout - Logout function
 */
export const handleAuthError = (error, logout) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    console.warn('Authentication error, logging out user');
    logout();
  }
};

/**
 * Storage keys for auth data
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

/**
 * Clear all auth data from storage
 */
export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Get auth data from storage
 * @returns {Object} - Auth data object with token and user
 */
export const getAuthFromStorage = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userStr ? JSON.parse(userStr) : null;
    
    return { token, user };
  } catch (error) {
    console.error('Error reading auth data from storage:', error);
    return { token: null, user: null };
  }
};

/**
 * Save auth data to storage
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
export const saveAuthToStorage = (token, user) => {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error saving auth data to storage:', error);
  }
};
