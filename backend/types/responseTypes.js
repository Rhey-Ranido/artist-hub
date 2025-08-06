/**
 * API Response Type Definitions
 * These type definitions help clients understand the structure of API responses
 * and can be used with TypeScript or for documentation purposes.
 */

// ==================== BASE RESPONSE TYPES ====================

/**
 * @typedef {Object} BaseResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} status - Response status ('success', 'error', 'validation_error')
 * @property {string} message - Human-readable message
 * @property {Object} meta - Metadata about the response
 * @property {string} meta.timestamp - ISO timestamp of the response
 */

/**
 * @typedef {Object} SuccessResponse
 * @extends BaseResponse
 * @property {boolean} success - Always true for success responses
 * @property {string} status - Always 'success'
 * @property {*} data - The response data
 */

/**
 * @typedef {Object} ErrorResponse
 * @extends BaseResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} status - 'error' or 'validation_error'
 * @property {Object} error - Error details
 * @property {string} [error.code] - Error code for programmatic handling
 * @property {string} [error.details] - Additional error details
 * @property {string} [error.field] - Field that caused the error (for validation errors)
 * @property {string} error.timestamp - ISO timestamp when error occurred
 */

/**
 * @typedef {Object} ValidationErrorResponse
 * @extends ErrorResponse
 * @property {string} status - Always 'validation_error'
 * @property {Object} error.fields - Field-specific validation errors
 */

// ==================== USER TYPES ====================

/**
 * @typedef {Object} User
 * @property {string} id - User's unique identifier
 * @property {string} username - User's username
 * @property {string} email - User's email address
 * @property {string} role - User's role ('user', 'admin', etc.)
 * @property {string} [firstName] - User's first name
 * @property {string} [lastName] - User's last name
 * @property {string} [bio] - User's biography
 * @property {string} [profileImage] - URL to user's profile image
 * @property {number} [artworksCount] - Number of artworks user has created
 * @property {number} [likesReceived] - Number of likes user has received
 * @property {Array<string>} [followers] - Array of user IDs who follow this user
 * @property {Array<string>} [following] - Array of user IDs this user follows
 * @property {string} [createdAt] - ISO timestamp of user creation
 * @property {string} [lastActive] - ISO timestamp of user's last activity
 */

// ==================== AUTHENTICATION RESPONSE TYPES ====================

/**
 * @typedef {Object} AuthData
 * @property {User} user - User information
 * @property {string} token - JWT authentication token
 * @property {string} expiresIn - Token expiration time (e.g., '24h')
 */

/**
 * @typedef {SuccessResponse} LoginSuccessResponse
 * @property {AuthData} data - Authentication data
 * @property {Object} meta - Login-specific metadata
 * @property {string} meta.loginTime - ISO timestamp of login
 * @property {string} [meta.userAgent] - User agent string
 */

/**
 * @typedef {SuccessResponse} RegisterSuccessResponse
 * @property {AuthData} data - Authentication data
 * @property {Object} meta - Registration-specific metadata
 * @property {string} meta.registrationTime - ISO timestamp of registration
 */

/**
 * @typedef {SuccessResponse} GetMeSuccessResponse
 * @property {Object} data - User profile data
 * @property {User} data.user - Complete user profile
 * @property {Object} meta - Profile retrieval metadata
 * @property {string} meta.retrievedAt - ISO timestamp of profile retrieval
 * @property {string} [meta.requestId] - Request ID for tracking
 */

// ==================== ERROR CODE CONSTANTS ====================

/**
 * Authentication Error Codes
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
};

/**
 * Validation Error Codes
 */
export const VALIDATION_ERROR_CODES = {
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  USERNAME_TOO_SHORT: 'USERNAME_TOO_SHORT',
  USERNAME_TOO_LONG: 'USERNAME_TOO_LONG',
};

/**
 * Conflict Error Codes
 */
export const CONFLICT_ERROR_CODES = {
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
};

/**
 * Server Error Codes
 */
export const SERVER_ERROR_CODES = {
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

// ==================== HTTP STATUS CODES ====================

export const HTTP_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500
};

// ==================== EXAMPLE RESPONSES ====================

/**
 * Example successful login response:
 * {
 *   "success": true,
 *   "status": "success",
 *   "message": "Login successful",
 *   "data": {
 *     "user": {
 *       "id": "64f8a7b2c3d4e5f6g7h8i9j0",
 *       "username": "johndoe",
 *       "email": "john@example.com",
 *       "role": "user",
 *       "firstName": "John",
 *       "lastName": "Doe"
 *     },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "expiresIn": "24h"
 *   },
 *   "meta": {
 *     "timestamp": "2023-12-07T10:30:00.000Z",
 *     "loginTime": "2023-12-07T10:30:00.000Z",
 *     "userAgent": "Mozilla/5.0..."
 *   }
 * }
 */

/**
 * Example validation error response:
 * {
 *   "success": false,
 *   "status": "validation_error",
 *   "message": "Validation failed",
 *   "error": {
 *     "code": "MISSING_REQUIRED_FIELDS",
 *     "details": "One or more fields failed validation",
 *     "fields": {
 *       "email": {
 *         "message": "Email is required",
 *         "code": "MISSING_REQUIRED_FIELDS"
 *       },
 *       "password": {
 *         "message": "Password is required",
 *         "code": "MISSING_REQUIRED_FIELDS"
 *       }
 *     },
 *     "timestamp": "2023-12-07T10:30:00.000Z"
 *   },
 *   "meta": {
 *     "timestamp": "2023-12-07T10:30:00.000Z"
 *   }
 * }
 */

/**
 * Example authentication error response:
 * {
 *   "success": false,
 *   "status": "error",
 *   "message": "Invalid email or password",
 *   "error": {
 *     "code": "INVALID_CREDENTIALS",
 *     "details": "The provided credentials do not match our records",
 *     "timestamp": "2023-12-07T10:30:00.000Z"
 *   },
 *   "meta": {
 *     "timestamp": "2023-12-07T10:30:00.000Z"
 *   }
 * }
 */
