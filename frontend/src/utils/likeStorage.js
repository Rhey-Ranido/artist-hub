/**
 * Utility functions for managing user-specific liked artworks in localStorage
 */

export const LIKED_ARTWORKS_KEY = 'userLikedArtworks';

/**
 * Get current user ID from localStorage
 * @returns {string|null} Current user ID or null if not logged in
 */
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user._id || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Get all user-specific liked artworks from localStorage
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Object} Object with artworkId as keys and like data as values
 */
export const getLikedArtworks = (userId = null) => {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) return {};
    
    const allUserLikes = JSON.parse(localStorage.getItem(LIKED_ARTWORKS_KEY) || '{}');
    return allUserLikes[targetUserId] || {};
  } catch (error) {
    console.error('Error reading liked artworks from localStorage:', error);
    return {};
  }
};

/**
 * Set liked artworks for a specific user
 * @param {Object} likedArtworks - Object with liked artworks data
 * @param {string} userId - Optional user ID, defaults to current user
 */
export const setLikedArtworks = (likedArtworks, userId = null) => {
  try {
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) return;
    
    const allUserLikes = JSON.parse(localStorage.getItem(LIKED_ARTWORKS_KEY) || '{}');
    allUserLikes[targetUserId] = likedArtworks;
    localStorage.setItem(LIKED_ARTWORKS_KEY, JSON.stringify(allUserLikes));
  } catch (error) {
    console.error('Error saving liked artworks to localStorage:', error);
  }
};

/**
 * Clear liked artworks for current user or all users
 * @param {string} userId - Optional user ID, if not provided clears current user
 * @param {boolean} clearAll - If true, clears all users' liked artworks
 */
export const clearLikedArtworks = (userId = null, clearAll = false) => {
  try {
    if (clearAll) {
      localStorage.removeItem(LIKED_ARTWORKS_KEY);
      return;
    }
    
    const targetUserId = userId || getCurrentUserId();
    if (!targetUserId) return;
    
    const allUserLikes = JSON.parse(localStorage.getItem(LIKED_ARTWORKS_KEY) || '{}');
    delete allUserLikes[targetUserId];
    localStorage.setItem(LIKED_ARTWORKS_KEY, JSON.stringify(allUserLikes));
  } catch (error) {
    console.error('Error clearing liked artworks from localStorage:', error);
  }
};

/**
 * Remove old liked artworks (older than 30 days) for current user
 */
export const cleanupOldLikedArtworks = () => {
  try {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    const likedArtworks = getLikedArtworks();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const cleaned = Object.fromEntries(
      Object.entries(likedArtworks).filter(([, data]) => 
        data.timestamp && data.timestamp > thirtyDaysAgo
      )
    );
    
    setLikedArtworks(cleaned);
  } catch (error) {
    console.error('Error cleaning up liked artworks:', error);
  }
};

/**
 * Get the count of liked artworks
 * @returns {number} Number of liked artworks
 */
export const getLikedArtworksCount = () => {
  const likedArtworks = getLikedArtworks();
  return Object.keys(likedArtworks).length;
};

/**
 * Check if an artwork is liked
 * @param {string} artworkId - The artwork ID
 * @returns {boolean} Whether the artwork is liked
 */
export const isArtworkLiked = (artworkId) => {
  const likedArtworks = getLikedArtworks();
  return Boolean(likedArtworks[artworkId]?.isLiked);
};

/**
 * Simulate logout event for testing purposes
 * This will trigger the heart button reset behavior
 */
export const simulateLogout = () => {
  window.dispatchEvent(new CustomEvent('authLogout'));
};

/**
 * Simulate login event for testing purposes
 * @param {Object} userData - User data to simulate login with
 * @param {string} token - Auth token
 */
export const simulateLogin = (userData, token) => {
  // Save to localStorage (simulating login)
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
  
  // Dispatch login event
  window.dispatchEvent(new CustomEvent('authUpdate', {
    detail: { user: userData, token }
  }));
};

/**
 * Get all users who have liked artworks
 * @returns {Array} Array of user IDs who have liked artworks
 */
export const getAllUsersWithLikes = () => {
  try {
    const allUserLikes = JSON.parse(localStorage.getItem(LIKED_ARTWORKS_KEY) || '{}');
    return Object.keys(allUserLikes);
  } catch (error) {
    console.error('Error getting users with likes:', error);
    return [];
  }
};

/**
 * Get liked artworks count for debugging
 * @returns {Object} Debug info about liked artworks
 */
export const getDebugInfo = () => {
  const currentUserId = getCurrentUserId();
  const likedArtworks = getLikedArtworks();
  const allUserLikes = JSON.parse(localStorage.getItem(LIKED_ARTWORKS_KEY) || '{}');
  
  return {
    currentUserId,
    totalLiked: Object.keys(likedArtworks).length,
    artworkIds: Object.keys(likedArtworks),
    details: likedArtworks,
    allUsers: Object.keys(allUserLikes),
    allUsersData: allUserLikes
  };
};

/**
 * Check if specific artwork is liked by current user (for debugging)
 * @param {string} artworkId - The artwork ID to check
 * @returns {Object} Debug info for specific artwork
 */
export const debugArtworkLikeState = (artworkId) => {
  const currentUserId = getCurrentUserId();
  const likedArtworks = getLikedArtworks();
  const artworkState = likedArtworks[artworkId];
  
  return {
    artworkId,
    currentUserId,
    isLiked: Boolean(artworkState?.isLiked),
    likesCount: artworkState?.likesCount || 0,
    timestamp: artworkState?.timestamp,
    hasPersistedState: Boolean(artworkState)
  };
};
