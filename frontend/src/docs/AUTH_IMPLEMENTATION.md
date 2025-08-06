# Authentication Implementation Guide

## Overview

This document describes the authentication implementation for the frontend application. The system provides global user state management, token persistence, and automatic UI updates when authentication state changes.

## Architecture

### 1. AuthContext (`src/contexts/AuthContext.jsx`)

The main authentication context that manages global user state:

- **State Management**: Handles user data, token, and loading states
- **Persistence**: Automatically saves/loads from localStorage
- **Event System**: Dispatches custom events for cross-component communication
- **Cross-tab Sync**: Listens for localStorage changes across browser tabs

### 2. Enhanced Forms

#### LoginForm (`src/components/LoginForm.jsx`)
- Uses `authApi.login()` for consistent API calls
- Integrates with AuthContext for state management
- Provides field-level error handling
- Automatically saves token/user on successful login

#### SignupForm (`src/components/SignupForm.jsx`)
- Uses `authApi.register()` for consistent API calls
- Integrates with AuthContext for state management
- Provides field-level error handling
- Automatically logs user in after successful registration

### 3. API Integration

#### Enhanced API Client (`src/utils/apiClient.js`)
- `handleAuthResponse()` function automatically saves auth data
- Consistent error handling with validation support
- Standardized response format

#### Auth Utilities (`src/utils/authUtils.js`)
- Helper functions for common auth operations
- Token validation, role checking, display formatting
- Storage management utilities

## Usage Examples

### Using AuthContext in Components

```jsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated()) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      {hasRole('admin') && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```jsx
import { useAuth } from '@/contexts/AuthContext';

function ProfileComponent() {
  const { getAuthHeader } = useAuth();
  
  const fetchProfile = async () => {
    const response = await fetch('/api/profile', {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  };
}
```

### Using Auth Utilities

```jsx
import { getUserDisplayName, isAdmin } from '@/utils/authUtils';

function UserCard({ user }) {
  return (
    <div>
      <h3>{getUserDisplayName(user)}</h3>
      {isAdmin(user) && <AdminBadge />}
    </div>
  );
}
```

## Key Features

### 1. Automatic Token/User Persistence
- Token and user data are automatically saved to localStorage
- Data persists across browser sessions
- Automatic cleanup on logout

### 2. Real-time UI Updates
- AuthContext dispatches custom events on auth state changes
- Components automatically re-render when user state changes
- Cross-tab synchronization via storage events

### 3. Consistent Error Handling
- Field-level validation errors in forms
- Standardized error messages
- Automatic token expiry handling

### 4. Role-based Access Control
- Built-in role checking utilities
- Easy integration with route guards
- Admin/provider role support

## Event System

The authentication system uses custom events for communication:

### Auth Events
- `authUpdate`: Fired when user logs in or user data updates
- `authLogout`: Fired when user logs out

### Usage
```jsx
// Listen for auth events
useEffect(() => {
  const handleAuthUpdate = (e) => {
    console.log('User updated:', e.detail.user);
  };
  
  window.addEventListener('authUpdate', handleAuthUpdate);
  return () => window.removeEventListener('authUpdate', handleAuthUpdate);
}, []);
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Token Validation**: Basic client-side token expiry checking
3. **Auto-logout**: Automatic logout on 401/403 errors
4. **Cross-tab Sync**: Logout in one tab affects all tabs

## Integration Points

### Existing Components Updated
- `Navbar.jsx`: Now uses AuthContext instead of local state
- `Login.jsx`: Simplified to use AuthContext
- `Register.jsx`: Simplified to use AuthContext
- `App.jsx`: Wrapped with AuthProvider

### API Integration
- All auth forms use the standardized `authApi` helpers
- Consistent error handling via `handleAuthResponse`
- Automatic token/user persistence

## Future Enhancements

1. **Route Guards**: Implement protected route components
2. **Token Refresh**: Add automatic token refresh logic
3. **Remember Me**: Add persistent login option
4. **Security Headers**: Implement CSRF protection
5. **Session Management**: Add session timeout handling

## Troubleshooting

### Debug Functions
The system includes debug utilities accessible via browser console:
```javascript
// Check current profile image data
window.debugProfileImage()
```

### Common Issues
1. **User not updating**: Check if AuthProvider wraps the component
2. **Token not persisting**: Verify localStorage is available
3. **Cross-tab not syncing**: Check storage event listeners

## Migration from Old System

The new system is backward compatible. Existing localStorage data will be automatically loaded. Components can gradually migrate from manual localStorage access to using the AuthContext.
