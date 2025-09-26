/**
 * API Client Utilities
 * Helper functions for handling standardized API responses on the client side
 */

// Import API configuration
import { API_ENDPOINTS } from '../config/api.js';

// API Response Handler Class
export class ApiResponse {
  constructor(response, data) {
    this.response = response;
    this.data = data;
    this.success = data.success;
    this.status = data.status;
    this.message = data.message;
    this.error = data.error;
    this.meta = data.meta;
  }

  /**
   * Check if the response indicates success
   */
  isSuccess() {
    return this.success === true;
  }

  /**
   * Check if the response indicates an error
   */
  isError() {
    return this.success === false;
  }

  /**
   * Check if the response indicates a validation error
   */
  isValidationError() {
    return this.status === 'validation_error';
  }

  /**
   * Get the response data (only available for successful responses)
   */
  getData() {
    return this.isSuccess() ? this.data?.data : null;
  }

  /**
   * Get error details
   */
  getError() {
    return this.isError() ? this.error : null;
  }

  /**
   * Get validation errors (field-specific errors)
   */
  getValidationErrors() {
    return this.isValidationError() ? this.error?.fields : null;
  }

  /**
   * Get error code for programmatic handling
   */
  getErrorCode() {
    return this.error?.code || null;
  }

  /**
   * Get error message for display to user
   */
  getErrorMessage() {
    return this.message || 'An unexpected error occurred';
  }

  /**
   * Get field-specific error message
   */
  getFieldError(fieldName) {
    const validationErrors = this.getValidationErrors();
    return validationErrors?.[fieldName]?.message || null;
  }

  /**
   * Check if a specific field has an error
   */
  hasFieldError(fieldName) {
    return this.getFieldError(fieldName) !== null;
  }

  /**
   * Get all field error messages as an object
   */
  getAllFieldErrors() {
    const validationErrors = this.getValidationErrors();
    if (!validationErrors) return {};
    
    const fieldErrors = {};
    Object.keys(validationErrors).forEach(field => {
      fieldErrors[field] = validationErrors[field].message;
    });
    return fieldErrors;
  }
}

/**
 * Enhanced fetch wrapper that returns ApiResponse instances
 */
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return new ApiResponse(response, data);

  } catch (error) {
    // Handle network errors or JSON parsing errors
    const errorData = {
      success: false,
      status: 'error',
      message: 'Network error or server unavailable',
      error: {
        code: 'NETWORK_ERROR',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return new ApiResponse(null, errorData);
  }
};

/**
 * Authentication API helpers
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (email, password) => {
    return apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register user
   */
  register: async (userData) => {
    return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Get current user profile
   */
  getMe: async (token) => {
    return apiRequest(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

/**
 * Error code constants for client-side handling
 */
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  
  // Validation errors
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  USERNAME_TOO_SHORT: 'USERNAME_TOO_SHORT',
  USERNAME_TOO_LONG: 'USERNAME_TOO_LONG',
  
  // Conflict errors
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  
  // Server errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

/**
 * Helper function to get user-friendly error messages
 */
export const getErrorMessage = (errorCode, defaultMessage = 'An error occurred') => {
  const errorMessages = {
    [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
    [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
    [ERROR_CODES.TOKEN_INVALID]: 'Invalid authentication token',
    [ERROR_CODES.NOT_AUTHENTICATED]: 'Please log in to continue',
    [ERROR_CODES.MISSING_REQUIRED_FIELDS]: 'Please fill in all required fields',
    [ERROR_CODES.INVALID_EMAIL_FORMAT]: 'Please enter a valid email address',
    [ERROR_CODES.PASSWORD_TOO_WEAK]: 'Password must be at least 6 characters long',
    [ERROR_CODES.USERNAME_TOO_SHORT]: 'Username must be at least 3 characters long',
    [ERROR_CODES.USERNAME_TOO_LONG]: 'Username must be less than 30 characters',
    [ERROR_CODES.EMAIL_ALREADY_EXISTS]: 'This email is already registered',
    [ERROR_CODES.USERNAME_ALREADY_EXISTS]: 'This username is already taken',
    [ERROR_CODES.DATABASE_ERROR]: 'Database error. Please try again.',
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Server error. Please try again later.',
    [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  };

  return errorMessages[errorCode] || defaultMessage;
};

/**
 * Helper function to handle authentication responses
 */
export const handleAuthResponse = (apiResponse, onSuccess, onError) => {
  if (apiResponse.isSuccess()) {
    const data = apiResponse.getData();
    
    // Store authentication data
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    if (onSuccess) {
      onSuccess(data);
    }
  } else {
    const errorMessage = apiResponse.getErrorMessage();
    const errorCode = apiResponse.getErrorCode();
    
    if (onError) {
      onError({
        message: errorMessage,
        code: errorCode,
        validationErrors: apiResponse.getAllFieldErrors(),
        isValidationError: apiResponse.isValidationError()
      });
    }
  }
};

/**
 * Example usage:
 * 
 * // Using the enhanced API client
 * const response = await authApi.login('user@example.com', 'password');
 * 
 * if (response.isSuccess()) {
 *   const userData = response.getData();
 *   console.log('Login successful:', userData.user);
 *   // Token is automatically available at userData.token
 * } else if (response.isValidationError()) {
 *   const fieldErrors = response.getAllFieldErrors();
 *   console.log('Validation errors:', fieldErrors);
 *   // Show field-specific errors in the form
 * } else {
 *   const errorMessage = response.getErrorMessage();
 *   console.log('Login failed:', errorMessage);
 *   // Show general error message
 * }
 * 
 * // Or use the helper function
 * handleAuthResponse(
 *   response,
 *   (data) => {
 *     console.log('Success:', data);
 *     // Redirect to dashboard
 *   },
 *   (error) => {
 *     console.log('Error:', error);
 *     // Show error in UI
 *   }
 * );
 */
