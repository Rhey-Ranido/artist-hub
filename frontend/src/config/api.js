/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */

// Get API base URL from environment variables or fallback to development
const getApiBaseUrl = () => {
  // In production (Vercel), use the same domain for API calls
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }
  
  // In development, use localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

// Get Socket.IO server URL
const getSocketUrl = () => {
  // In production (Vercel), use the same domain
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_SOCKET_URL || window.location.origin;
  }
  
  // In development, use localhost
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
};

// Export configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  SOCKET_URL: getSocketUrl(),
  TIMEOUT: 10000, // 10 seconds
};

// Export individual URLs for convenience
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const SOCKET_URL = API_CONFIG.SOCKET_URL;

// API endpoints object for better organization
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  
  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    PASSWORD: `${API_BASE_URL}/users/password`,
    BY_USERNAME: (username) => `${API_BASE_URL}/users/${username}`,
  },
  
  // Artworks
  ARTWORKS: {
    SEARCH: `${API_BASE_URL}/artworks/search`,
    FEED: `${API_BASE_URL}/artworks/feed`,
    BY_USER: (username) => `${API_BASE_URL}/artworks/user/${username}`,
  },
  
  // Upload
  UPLOAD: {
    PROFILE_USER: `${API_BASE_URL}/upload/profile/user`,
    PROFILE_USER_SIMPLE: `${API_BASE_URL}/upload/profile/user/simple`,
    PROFILE_PROVIDER: `${API_BASE_URL}/upload/profile/provider`,
    CHAT: `${API_BASE_URL}/upload/chat`,
    SERVICE: (serviceId) => `${API_BASE_URL}/upload/service/${serviceId}`,
    TUTORIALS_STEP: `${API_BASE_URL}/upload/tutorials/step`,
    TUTORIALS_THUMBNAIL: `${API_BASE_URL}/upload/tutorials/thumbnail`,
  },
  
  // Chat & Messages
  CHAT: {
    BASE: `${API_BASE_URL}/chat`,
    TEST: `${API_BASE_URL}/chat/test`,
    USERS: `${API_BASE_URL}/chat/users`,
    MESSAGES: (chatId) => `${API_BASE_URL}/message/${chatId}`,
  },
  
  // Messages
  MESSAGE: {
    BASE: `${API_BASE_URL}/message`,
    BY_ID: (messageId) => `${API_BASE_URL}/message/${messageId}`,
  },
  
  // Services
  SERVICES: {
    BASE: `${API_BASE_URL}/services`,
    BY_ID: (serviceId) => `${API_BASE_URL}/services/${serviceId}`,
    PROVIDER_ME: `${API_BASE_URL}/services/provider/me`,
  },
  
  // Providers
  PROVIDERS: {
    BASE: `${API_BASE_URL}/providers`,
    BY_ID: (providerId) => `${API_BASE_URL}/providers/${providerId}`,
    ME: `${API_BASE_URL}/providers/me`,
  },
  
  // Reviews
  REVIEWS: {
    SERVICE: (serviceId) => `${API_BASE_URL}/reviewService/${serviceId}`,
    SERVICE_BY_ID: (reviewId) => `${API_BASE_URL}/reviewService/${reviewId}`,
    PROVIDER: (providerId) => `${API_BASE_URL}/reviewProvider/${providerId}`,
    PROVIDER_BY_ID: (reviewId) => `${API_BASE_URL}/reviewProvider/${reviewId}`,
  },
  
  // Tutorials
  TUTORIALS: {
    ACCESSIBLE: `${API_BASE_URL}/tutorials/accessible`,
    BY_ID: (tutorialId) => `${API_BASE_URL}/tutorials/${tutorialId}`,
    REACTION: (tutorialId) => `${API_BASE_URL}/tutorials/${tutorialId}/reaction`,
    COMPLETE: (tutorialId) => `${API_BASE_URL}/tutorials/${tutorialId}/complete`,
  },
  
  // Admin
  ADMIN: {
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
    USERS: `${API_BASE_URL}/admin/users`,
    USER_BY_ID: (userId) => `${API_BASE_URL}/admin/users/${userId}`,
    USER_STATUS: (userId) => `${API_BASE_URL}/admin/users/${userId}/status`,
    USER_STATS: (userId) => `${API_BASE_URL}/admin/users/${userId}/stats`,
    ARTWORKS: `${API_BASE_URL}/admin/artworks`,
    ARTWORK_BY_ID: (artworkId) => `${API_BASE_URL}/admin/artworks/${artworkId}`,
    ARTWORK_STATUS: (artworkId) => `${API_BASE_URL}/admin/artworks/${artworkId}/status`,
    TUTORIALS: `${API_BASE_URL}/admin/tutorials`,
    TUTORIAL_BY_ID: (tutorialId) => `${API_BASE_URL}/admin/tutorials/${tutorialId}`,
    TUTORIAL_STATUS: (tutorialId) => `${API_BASE_URL}/admin/tutorials/${tutorialId}/status`,
    PROVIDERS: `${API_BASE_URL}/admin/providers`,
    PROVIDER_BY_ID: (providerId) => `${API_BASE_URL}/admin/providers/${providerId}`,
    PROVIDER_STATUS: (providerId) => `${API_BASE_URL}/admin/providers/${providerId}/status`,
  },
  
  // Stats
  STATS: {
    PLATFORM: `${API_BASE_URL}/stats/platform`,
  },
};

// Helper function to build query string
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Helper function to get full URL with query params
export const buildApiUrl = (baseUrl, params = {}) => {
  const queryString = buildQueryString(params);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

console.log('API Configuration:', {
  BASE_URL: API_BASE_URL,
  SOCKET_URL: SOCKET_URL,
  ENVIRONMENT: import.meta.env.MODE,
  IS_PRODUCTION: import.meta.env.PROD,
});
