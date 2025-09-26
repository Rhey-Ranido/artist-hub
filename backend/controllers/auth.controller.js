import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { 
  STATUS_CODES, 
  ERROR_CODES, 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  sendSuccessResponse,
  sendErrorResponse,
  authResponses 
} from "../utils/responseUtils.js";



export const register = async (req, res) => {
  let { username, email, password, role, firstName, lastName, level } = req.body;

  try {
    // Default role to "user" if not provided
    role = role || "user";
    // Default level to "beginner" if not provided
    level = level || "beginner";

    // Comprehensive validation
    const validationErrors = {};

    // Required fields validation
    if (!username) {
      validationErrors.username = {
        message: 'Username is required',
        code: ERROR_CODES.MISSING_REQUIRED_FIELDS
      };
    }
    
    if (!email) {
      validationErrors.email = {
        message: 'Email is required',
        code: ERROR_CODES.MISSING_REQUIRED_FIELDS
      };
    }
    
    if (!password) {
      validationErrors.password = {
        message: 'Password is required',
        code: ERROR_CODES.MISSING_REQUIRED_FIELDS
      };
    }

    // Username length validation
    if (username && (username.length < 3 || username.length > 30)) {
      validationErrors.username = {
        message: 'Username must be between 3 and 30 characters',
        code: username.length < 3 ? ERROR_CODES.USERNAME_TOO_SHORT : ERROR_CODES.USERNAME_TOO_LONG
      };
    }

    // Email format validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = {
        message: 'Please provide a valid email address',
        code: ERROR_CODES.INVALID_EMAIL_FORMAT
      };
    }

    // Password strength validation
    if (password && password.length < 6) {
      validationErrors.password = {
        message: 'Password must be at least 6 characters long',
        code: ERROR_CODES.PASSWORD_TOO_WEAK
      };
    }

    // Username format validation (alphanumeric and underscores only)
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      validationErrors.username = {
        message: 'Username can only contain letters, numbers, and underscores',
        code: ERROR_CODES.MISSING_REQUIRED_FIELDS
      };
    }

    if (Object.keys(validationErrors).length > 0) {
      return sendErrorResponse(
        res, 
        STATUS_CODES.VALIDATION_ERROR, 
        createValidationErrorResponse(validationErrors)
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return sendErrorResponse(
          res, 
          STATUS_CODES.CONFLICT, 
          authResponses.emailAlreadyExists()
        );
      } else {
        return sendErrorResponse(
          res, 
          STATUS_CODES.CONFLICT, 
          authResponses.usernameAlreadyExists()
        );
      }
    }

    // Create user
    const user = await User.create({ 
      username, 
      email, 
      password, 
      role,
      level,
      firstName: firstName || '',
      lastName: lastName || ''
    });

    // Generate token
    const token = generateToken(user);

    // Send success response
    const successResponse = authResponses.registerSuccess(user, token);
    
    return sendSuccessResponse(res, STATUS_CODES.CREATED, successResponse);

  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle specific MongoDB errors
    let errorResponse;
    
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyValue)[0];
      if (field === 'email') {
        errorResponse = authResponses.emailAlreadyExists();
      } else if (field === 'username') {
        errorResponse = authResponses.usernameAlreadyExists();
      } else {
        errorResponse = createErrorResponse({
          message: `${field} already exists`,
          errorCode: ERROR_CODES.CONFLICT,
          details: `A user with this ${field} already exists`
        });
      }
      return sendErrorResponse(res, STATUS_CODES.CONFLICT, errorResponse);
    }
    
    // General server error
    errorResponse = createErrorResponse({
      message: 'Registration failed due to server error',
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
      details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    });
    
    return sendErrorResponse(res, STATUS_CODES.INTERNAL_ERROR, errorResponse);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    const validationErrors = {};
    
    if (!email) {
      validationErrors.email = {
        message: 'Email is required',
        code: ERROR_CODES.MISSING_REQUIRED_FIELDS
      };
    }
    
    if (!password) {
      validationErrors.password = {
        message: 'Password is required',
        code: ERROR_CODES.MISSING_REQUIRED_FIELDS
      };
    }

    // Email format validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = {
        message: 'Please provide a valid email address',
        code: ERROR_CODES.INVALID_EMAIL_FORMAT
      };
    }

    if (Object.keys(validationErrors).length > 0) {
      return sendErrorResponse(
        res, 
        STATUS_CODES.VALIDATION_ERROR, 
        createValidationErrorResponse(validationErrors)
      );
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendErrorResponse(
        res, 
        STATUS_CODES.UNAUTHORIZED, 
        authResponses.invalidCredentials()
      );
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return sendErrorResponse(
        res, 
        STATUS_CODES.UNAUTHORIZED, 
        authResponses.invalidCredentials()
      );
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Send success response
    const successResponse = authResponses.loginSuccess(user, token);
    
    // Add user agent info if available
    if (req.headers['user-agent']) {
      successResponse.meta.userAgent = req.headers['user-agent'];
    }

    return sendSuccessResponse(res, STATUS_CODES.SUCCESS, successResponse);

  } catch (err) {
    console.error("Login error:", err);
    
    const errorResponse = createErrorResponse({
      message: 'Login failed due to server error',
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
      details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    });
    
    return sendErrorResponse(res, STATUS_CODES.INTERNAL_ERROR, errorResponse);
  }
};

// Controller: Get authenticated user info
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendErrorResponse(
        res, 
        STATUS_CODES.UNAUTHORIZED, 
        authResponses.notAuthenticated()
      );
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return sendErrorResponse(
        res, 
        STATUS_CODES.NOT_FOUND, 
        authResponses.userNotFound()
      );
    }

    // Construct profile image URL if exists (for backward compatibility)
    const profileImageUrl = user.profileImageData || (user.profileImage 
      ? `${req.protocol}://${req.get('host')}/uploads/${user.profileImage}`
      : null);

    const successResponse = createSuccessResponse({
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          profileImage: user.profileImage,
          profileImageData: user.profileImageData,
          profileImageUrl: profileImageUrl,
          artworksCount: user.artworksCount,
          likesReceived: user.likesReceived,
          followers: user.followers,
          following: user.following,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        }
      },
      meta: {
        requestId: req.headers['x-request-id'] || null,
        retrievedAt: new Date().toISOString()
      }
    });

    return sendSuccessResponse(res, STATUS_CODES.SUCCESS, successResponse);

  } catch (err) {
    console.error("Error in getMe:", err);
    
    const errorResponse = createErrorResponse({
      message: 'Failed to retrieve user profile',
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
      details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    });
    
    return sendErrorResponse(res, STATUS_CODES.INTERNAL_ERROR, errorResponse);
  }
};
