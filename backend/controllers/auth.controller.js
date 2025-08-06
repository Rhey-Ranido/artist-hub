import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const formatUserResponse = (user) => ({
  user: { 
    id: user._id, 
    username: user.username,
    email: user.email, 
    role: user.role,
    profileImage: user.profileImage,
    bio: user.bio,
    artworksCount: user.artworksCount,
    likesReceived: user.likesReceived
  },
  token: generateToken(user),
});

export const register = async (req, res) => {
  let { username, email, password, role, firstName, lastName } = req.body;

  try {
    // Default role to "user" if not provided
    role = role || "user";

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username, email, and password are required" 
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ 
        success: false, 
        message: "Username must be between 3 and 30 characters" 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ 
        success: false, 
        message: `${field} already in use` 
      });
    }

    // Create user
    const user = await User.create({ 
      username, 
      email, 
      password, 
      role,
      firstName: firstName || '',
      lastName: lastName || ''
    });

    // Respond
    res.status(201).json({
      success: true,
      message: "Registration successful",
      ...formatUserResponse(user)
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed", 
      error: err.message 
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    const validPassword = user && (await user.comparePassword(password));

    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Respond
    res.status(200).json({
      success: true,
      message: "Login successful",
      ...formatUserResponse(user)
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Login failed", 
      error: err.message 
    });
  }
};

// Controller: Get authenticated user info
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profileImage: user.profileImage,
        artworksCount: user.artworksCount,
        likesReceived: user.likesReceived,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("Error in getMe:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
