import { useState, useEffect, useCallback } from 'react';
import { getLikedArtworks, setLikedArtworks } from '../utils/likeStorage';

/**
 * Custom hook for managing artwork like state with localStorage persistence
 * @param {string} artworkId - The ID of the artwork
 * @param {number} initialLikesCount - Initial likes count from server
 * @param {boolean} initialIsLiked - Initial liked state from server
 * @returns {Object} - { likesCount, isLiked, toggleLike, likeLoading }
 */
export const usePersistedLike = (artworkId, initialLikesCount = 0, initialIsLiked = false) => {
  // Get current user ID
  const getCurrentUserId = useCallback(() => {
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
  }, []);

  // Get persisted like state from localStorage for current user
  const getPersistedLikeState = useCallback(() => {
    try {
      const likedArtworks = getLikedArtworks();
      return likedArtworks[artworkId] || null;
    } catch (error) {
      console.error('Error reading liked artworks from localStorage:', error);
      return null;
    }
  }, [artworkId]);

  // Set persisted like state in localStorage for current user
  const setPersistedLikeState = useCallback((isLiked, likesCount) => {
    try {
      const likedArtworks = getLikedArtworks();
      
      if (isLiked) {
        likedArtworks[artworkId] = {
          isLiked: true,
          likesCount,
          timestamp: Date.now()
        };
      } else {
        delete likedArtworks[artworkId];
      }
      
      setLikedArtworks(likedArtworks);
    } catch (error) {
      console.error('Error saving liked artworks to localStorage:', error);
    }
  }, [artworkId]);

  // Initialize state with persisted data or server data
  const [likesCount, setLikesCount] = useState(() => {
    const persistedState = getPersistedLikeState();
    return persistedState ? persistedState.likesCount : initialLikesCount;
  });

  const [isLiked, setIsLiked] = useState(() => {
    const persistedState = getPersistedLikeState();
    return persistedState ? persistedState.isLiked : initialIsLiked;
  });

  const [likeLoading, setLikeLoading] = useState(false);

  // Update local storage when state changes (but avoid initial sync)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (hasInitialized && (isLiked !== initialIsLiked || likesCount !== initialLikesCount)) {
      setPersistedLikeState(isLiked, likesCount);
    }
  }, [isLiked, likesCount, initialIsLiked, initialLikesCount, hasInitialized, setPersistedLikeState]);

  // Sync with server data when it changes (only when initial values change)
  useEffect(() => {
    if (hasInitialized && artworkId) {
      const persistedState = getPersistedLikeState();
      
      // If no persisted state for this user, use server state
      if (!persistedState) {
        setLikesCount(initialLikesCount);
        setIsLiked(initialIsLiked);
      } else {
        // Use persisted state (user's saved preference)
        setLikesCount(persistedState.likesCount);
        setIsLiked(persistedState.isLiked);
      }
    }
  }, [initialLikesCount, initialIsLiked, hasInitialized, artworkId]); // Added artworkId to ensure it's available

  // Listen for logout events to reset UI state (but preserve user data)
  useEffect(() => {
    const handleLogout = () => {
      // Reset to "ready to like" state (unfilled heart) for UI
      // User's liked artworks are preserved in localStorage under their user ID
      setIsLiked(false);
      // Keep the current like count as it should remain accurate
    };

    window.addEventListener('authLogout', handleLogout);
    
    return () => {
      window.removeEventListener('authLogout', handleLogout);
    };
  }, []);

  // Listen for login events to restore user-specific like state
  useEffect(() => {
    const handleAuthUpdate = () => {
      // Restore user's like state when they log in
      const persistedState = getPersistedLikeState();
      if (persistedState) {
        setIsLiked(persistedState.isLiked);
        setLikesCount(persistedState.likesCount);
      } else {
        // If no persisted state for this user, use server state
        setIsLiked(initialIsLiked);
        setLikesCount(initialLikesCount);
      }
    };

    window.addEventListener('authUpdate', handleAuthUpdate);
    
    return () => {
      window.removeEventListener('authUpdate', handleAuthUpdate);
    };
  }, [initialIsLiked, initialLikesCount]); // Removed getPersistedLikeState from dependencies

  // Initialize when artworkId is available
  useEffect(() => {
    if (artworkId && !hasInitialized) {
      const currentUserId = getCurrentUserId();
      if (currentUserId) {
        // User is logged in, check their persisted state
        const persistedState = getPersistedLikeState();
        if (persistedState) {
          setIsLiked(persistedState.isLiked);
          setLikesCount(persistedState.likesCount);
        } else {
          // No persisted state, use initial values from server
          setIsLiked(initialIsLiked);
          setLikesCount(initialLikesCount);
        }
      } else {
        // No user logged in, reset to unfilled state but keep count
        setIsLiked(false);
        setLikesCount(initialLikesCount);
      }
      // Mark as initialized after first setup
      setHasInitialized(true);
    }
  }, [artworkId, hasInitialized, initialIsLiked, initialLikesCount]); // Run when artworkId becomes available

  const toggleLike = useCallback(async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      setLikeLoading(true);
      
      // Optimistic update
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
      
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      setPersistedLikeState(newIsLiked, newLikesCount);

      // Make API call
      const response = await fetch(`http://localhost:5000/api/artworks/${artworkId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'like' }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update with server response
        setLikesCount(data.likesCount ?? 0);
        setIsLiked(Boolean(data.isLiked));
        setPersistedLikeState(Boolean(data.isLiked), data.likesCount ?? 0);
      } else {
        // Revert optimistic update on error
        setIsLiked(!newIsLiked);
        setLikesCount(likesCount);
        setPersistedLikeState(!newIsLiked, likesCount);
        throw new Error(data.message || 'Failed to toggle like');
      }
    } catch (err) {
      console.error('Toggle like error:', err);
      // Revert optimistic update on error
      const revertedIsLiked = !isLiked;
      setIsLiked(!revertedIsLiked);
      setLikesCount(revertedIsLiked ? likesCount - 1 : likesCount + 1);
    } finally {
      setLikeLoading(false);
    }
  }, [artworkId, isLiked, likesCount, setPersistedLikeState]);

  return {
    likesCount,
    isLiked,
    toggleLike,
    likeLoading
  };
};
