/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          const userData = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Listen for localStorage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setToken(savedToken);
            setUser(userData);
          } catch (error) {
            console.error('Error parsing user data:', error);
            logout();
          }
        } else {
          setToken(null);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom auth events
  useEffect(() => {
    const handleAuthUpdate = (e) => {
      const { token: newToken, user: newUser } = e.detail;
      setToken(newToken);
      setUser(newUser);
    };

    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('authUpdate', handleAuthUpdate);
    window.addEventListener('authLogout', handleLogout);

    return () => {
      window.removeEventListener('authUpdate', handleAuthUpdate);
      window.removeEventListener('authLogout', handleLogout);
    };
  }, []);

  // Login function
  const login = (userData, authToken) => {
    try {
      // Save to localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(authToken);
      setUser(userData);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('authUpdate', {
        detail: { token: authToken, user: userData }
      }));
      
      console.log('User logged in:', userData);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update state
      setToken(null);
      setUser(null);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('authLogout'));
      
      console.log('User logged out');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user data (for profile updates)
  const updateUser = (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      // Update state
      setUser(newUserData);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('authUpdate', {
        detail: { token, user: newUserData }
      }));
      
      console.log('User data updated:', newUserData);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Get auth header for API calls
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    getAuthHeader
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
