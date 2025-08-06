# API Response Format Documentation

This document describes the standardized response format used across all API endpoints to make client-side handling more predictable and easier.

## Overview

All API responses follow a consistent structure that includes:
- Success/error status
- Descriptive messages
- Structured data or error information
- Metadata for additional context
- Error codes for programmatic handling

## Response Structure

### Success Response Format

```json
{
  "success": true,
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response-specific data
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z",
    // Additional metadata
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "status": "error",
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details",
    "field": "fieldName", // For field-specific errors
    "timestamp": "2023-12-07T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z"
  }
}
```

### Validation Error Response Format

```json
{
  "success": false,
  "status": "validation_error",
  "message": "Validation failed",
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "details": "One or more fields failed validation",
    "fields": {
      "email": {
        "message": "Email is required",
        "code": "MISSING_REQUIRED_FIELDS"
      },
      "password": {
        "message": "Password must be at least 6 characters long",
        "code": "PASSWORD_TOO_WEAK"
      }
    },
    "timestamp": "2023-12-07T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z"
  }
}
```

## Authentication Endpoints

### POST /api/auth/login

#### Success Response (200)
```json
{
  "success": true,
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f8a7b2c3d4e5f6g7h8i9j0",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": null,
      "bio": null,
      "artworksCount": 0,
      "likesReceived": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z",
    "loginTime": "2023-12-07T10:30:00.000Z",
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### Error Responses

**Invalid Credentials (401)**
```json
{
  "success": false,
  "status": "error",
  "message": "Invalid email or password",
  "error": {
    "code": "INVALID_CREDENTIALS",
    "details": "The provided credentials do not match our records",
    "timestamp": "2023-12-07T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z"
  }
}
```

**Validation Error (422)**
```json
{
  "success": false,
  "status": "validation_error",
  "message": "Validation failed",
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "details": "One or more fields failed validation",
    "fields": {
      "email": {
        "message": "Email is required",
        "code": "MISSING_REQUIRED_FIELDS"
      }
    },
    "timestamp": "2023-12-07T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z"
  }
}
```

### POST /api/auth/register

#### Success Response (201)
```json
{
  "success": true,
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "64f8a7b2c3d4e5f6g7h8i9j1",
      "username": "newuser",
      "email": "newuser@example.com",
      "role": "user",
      "firstName": "New",
      "lastName": "User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z",
    "registrationTime": "2023-12-07T10:30:00.000Z"
  }
}
```

#### Error Responses

**Email Already Exists (409)**
```json
{
  "success": false,
  "status": "error",
  "message": "Email address is already registered",
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "details": "An account with this email already exists. Try logging in instead.",
    "field": "email",
    "timestamp": "2023-12-07T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z"
  }
}
```

### GET /api/auth/me

#### Success Response (200)
```json
{
  "success": true,
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "64f8a7b2c3d4e5f6g7h8i9j0",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Artist and developer",
      "profileImage": "https://example.com/profile.jpg",
      "artworksCount": 5,
      "likesReceived": 42,
      "followers": ["user1", "user2"],
      "following": ["user3", "user4"],
      "createdAt": "2023-01-15T08:00:00.000Z",
      "lastActive": "2023-12-07T10:25:00.000Z"
    }
  },
  "meta": {
    "timestamp": "2023-12-07T10:30:00.000Z",
    "retrievedAt": "2023-12-07T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

## Error Codes

### Authentication Error Codes
- `INVALID_CREDENTIALS` - Invalid email or password
- `USER_NOT_FOUND` - User does not exist
- `TOKEN_EXPIRED` - Authentication token has expired
- `TOKEN_INVALID` - Authentication token is invalid
- `NOT_AUTHENTICATED` - Authentication required

### Validation Error Codes
- `MISSING_REQUIRED_FIELDS` - Required field is missing
- `INVALID_EMAIL_FORMAT` - Email format is invalid
- `PASSWORD_TOO_WEAK` - Password doesn't meet requirements
- `USERNAME_TOO_SHORT` - Username is too short
- `USERNAME_TOO_LONG` - Username is too long

### Conflict Error Codes
- `EMAIL_ALREADY_EXISTS` - Email is already registered
- `USERNAME_ALREADY_EXISTS` - Username is already taken

### Server Error Codes
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_SERVER_ERROR` - General server error

## HTTP Status Codes

- `200` - Success
- `201` - Created (successful registration)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `422` - Validation Error
- `500` - Internal Server Error

## Client-Side Handling

### JavaScript Example

```javascript
import { authApi, handleAuthResponse } from '@/utils/apiClient';

// Login example
const response = await authApi.login('user@example.com', 'password');

if (response.isSuccess()) {
  const userData = response.getData();
  console.log('Login successful:', userData.user);
  // Token is automatically stored in localStorage
} else if (response.isValidationError()) {
  const fieldErrors = response.getAllFieldErrors();
  console.log('Validation errors:', fieldErrors);
  // Display field-specific errors in the form
} else {
  const errorMessage = response.getErrorMessage();
  const errorCode = response.getErrorCode();
  console.log('Login failed:', errorMessage, errorCode);
  // Handle specific error codes
  if (errorCode === 'INVALID_CREDENTIALS') {
    // Show "Invalid email or password" message
  }
}
```

### React Hook Example

```javascript
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    const response = await authApi.login(email, password);
    
    handleAuthResponse(
      response,
      (data) => {
        setUser(data.user);
        setLoading(false);
      },
      (errorInfo) => {
        setError(errorInfo);
        setLoading(false);
      }
    );
  };

  return { user, loading, error, login };
};
```

## Benefits for Clients

1. **Predictable Structure**: All responses follow the same format
2. **Error Codes**: Programmatic error handling with specific codes
3. **Field-Specific Validation**: Detailed validation errors for forms
4. **Metadata**: Additional context like timestamps and request IDs
5. **Type Safety**: Clear data structures for TypeScript projects
6. **Better UX**: More informative error messages for users

## Migration Notes

If you're updating existing client code:

1. Check `response.success` instead of HTTP status codes
2. Use `response.data` for successful response data
3. Use `response.error.fields` for validation errors
4. Use `response.error.code` for programmatic error handling
5. Access user data at `response.data.user` instead of `response.user`
6. Access token at `response.data.token` instead of `response.token`
