/**
 * Standardized API Response Utilities
 * Provides consistent response formats for better client handling
 */

// Response status codes with descriptive names
export const STATUS_CODES = {
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

// Error codes for specific client handling
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
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

/**
 * Creates a standardized success response
 */
export const createSuccessResponse = ({
  message = 'Request successful',
  data = null,
  meta = {}
}) => {
  return {
    success: true,
    status: 'success',
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
};

/**
 * Creates a standardized error response
 */
export const createErrorResponse = ({
  message = 'An error occurred',
  errorCode = null,
  details = null,
  field = null,
  meta = {}
}) => {
  const response = {
    success: false,
    status: 'error',
    message,
    error: {
      code: errorCode,
      details,
      field,
      timestamp: new Date().toISOString()
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };

  // Remove null fields for cleaner response
  if (!errorCode) delete response.error.code;
  if (!details) delete response.error.details;
  if (!field) delete response.error.field;

  return response;
};

/**
 * Creates a validation error response with field-specific errors
 */
export const createValidationErrorResponse = (validationErrors) => {
  return {
    success: false,
    status: 'validation_error',
    message: 'Validation failed',
    error: {
      code: ERROR_CODES.MISSING_REQUIRED_FIELDS,
      details: 'One or more fields failed validation',
      fields: validationErrors,
      timestamp: new Date().toISOString()
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Sends a success response
 */
export const sendSuccessResponse = (res, statusCode, responseData) => {
  return res.status(statusCode).json(responseData);
};

/**
 * Sends an error response
 */
export const sendErrorResponse = (res, statusCode, responseData) => {
  return res.status(statusCode).json(responseData);
};

/**
 * Authentication-specific response helpers
 */
export const authResponses = {
  loginSuccess: (user, token) => createSuccessResponse({
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        artworksCount: user.artworksCount,
        likesReceived: user.likesReceived,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token,
      expiresIn: '24h'
    },
    meta: {
      loginTime: new Date().toISOString(),
      userAgent: null // Can be populated from req.headers['user-agent']
    }
  }),

  registerSuccess: (user, token) => createSuccessResponse({
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token,
      expiresIn: '24h'
    },
    meta: {
      registrationTime: new Date().toISOString()
    }
  }),

  invalidCredentials: () => createErrorResponse({
    message: 'Invalid email or password',
    errorCode: ERROR_CODES.INVALID_CREDENTIALS,
    details: 'The provided credentials do not match our records'
  }),

  emailAlreadyExists: () => createErrorResponse({
    message: 'Email address is already registered',
    errorCode: ERROR_CODES.EMAIL_ALREADY_EXISTS,
    details: 'An account with this email already exists. Try logging in instead.',
    field: 'email'
  }),

  usernameAlreadyExists: () => createErrorResponse({
    message: 'Username is already taken',
    errorCode: ERROR_CODES.USERNAME_ALREADY_EXISTS,
    details: 'Please choose a different username',
    field: 'username'
  }),

  notAuthenticated: () => createErrorResponse({
    message: 'Authentication required',
    errorCode: ERROR_CODES.NOT_AUTHENTICATED,
    details: 'Please log in to access this resource'
  }),

  userNotFound: () => createErrorResponse({
    message: 'User not found',
    errorCode: ERROR_CODES.USER_NOT_FOUND,
    details: 'The requested user does not exist'
  })
};
