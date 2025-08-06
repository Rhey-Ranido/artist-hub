import User from "../models/User.js";
import Artwork from "../models/Artwork.js";

// Get user profile by ID or username
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a valid ObjectId (MongoDB ID)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let user;
    if (isObjectId) {
      // Search by ID
      user = await User.findById(id)
        .select("-password")
        .populate('followers', 'username profileImage')
        .populate('following', 'username profileImage');
    } else {
      // Search by username
      user = await User.findOne({ username: id })
        .select("-password")
        .populate('followers', 'username profileImage')
        .populate('following', 'username profileImage');
    }
      
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Get user's public artworks count
    const publicArtworksCount = await Artwork.countDocuments({ 
      artist: user._id, 
      isPublic: true 
    });

    // Construct full profile image URL with explicit port
    const host = req.get('host') || 'localhost:5000';
    const profileImageUrl = user.profileImage
      ? `${req.protocol}://${host}${user.profileImage}`
      : null;

    console.log('Profile Image Debug:', {
      profileImage: user.profileImage,
      profileImageUrl: profileImageUrl,
      protocol: req.protocol,
      host: req.get('host')
    });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        profileImageUrl,
        publicArtworksCount
      }
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, firstName, lastName, bio } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if username is taken (if changing)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already taken" 
        });
      }
      user.username = username;
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(userId).select("-password");
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update profile image path
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Follow/Unfollow user
export const toggleFollow = async (req, res) => {
  try {
    const { id } = req.params; // User to follow/unfollow
    const userId = req.user.id; // Current user

    if (id === userId) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot follow yourself" 
      });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const isFollowing = currentUser.following.includes(id);
    let action;

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(id);
      userToFollow.followers.pull(userId);
      action = "unfollowed";
    } else {
      // Follow
      currentUser.following.push(id);
      userToFollow.followers.push(userId);
      action = "followed";
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      success: true,
      message: `User ${action}`,
      isFollowing: action === "followed",
      followersCount: userToFollow.followers.length
    });
  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { bio: searchRegex }
      ]
    })
      .select('username firstName lastName bio profileImage artworksCount likesReceived')
      .sort({ artworksCount: -1, likesReceived: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { bio: searchRegex }
      ]
    });

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};