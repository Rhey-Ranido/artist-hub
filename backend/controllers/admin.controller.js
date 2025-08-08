import Provider from "../models/Provider.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Artwork from "../models/Artwork.js";
import Tutorial from "../models/Tutorial.js";
import Comment from "../models/Comment.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// Get single tutorial details (admin)
export const getTutorialDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const tutorial = await Tutorial.findById(id)
      .populate('author', 'username profileImage firstName lastName email')
      .lean();

    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    return res.status(200).json(tutorial);
  } catch (error) {
    console.error("Error getting tutorial details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all providers for admin review
export const getAllProvidersForAdmin = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const providers = await Provider.find(filter)
      .populate('userId', 'email firstName lastName isVerified createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalProviders = await Provider.countDocuments(filter);

    // Format response
    const formattedProviders = providers.map(provider => ({
      id: provider._id,
      name: provider.name,
      bio: provider.bio,
      profileImage: provider.profileImage,
      location: provider.location.address,
      status: provider.status,
      categories: provider.categories,
      skills: provider.skills,
      languages: provider.languages,
      socialLinks: provider.socialLinks,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
      user: {
        id: provider.userId._id,
        email: provider.userId.email,
        firstName: provider.userId.firstName,
        lastName: provider.userId.lastName,
        isVerified: provider.userId.isVerified,
        createdAt: provider.userId.createdAt
      }
    }));

    res.status(200).json({
      providers: formattedProviders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalProviders / limit),
        totalProviders,
        hasNextPage: page * limit < totalProviders,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error getting providers for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get provider details for admin review
export const getProviderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id)
      .populate('userId', 'email firstName lastName isVerified createdAt lastActive');

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Get provider's services
    const services = await Service.find({ providerId: id })
      .select('title description price category isActive createdAt')
      .lean();

    // Get status counts for dashboard
    const statusCounts = await Provider.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      provider: {
        id: provider._id,
        name: provider.name,
        bio: provider.bio,
        profileImage: provider.profileImage,
        location: provider.location,
              status: provider.status,
      rejectionReason: provider.rejectionReason,
      adminFeedback: provider.adminFeedback,
      statusUpdatedAt: provider.statusUpdatedAt,
      categories: provider.categories,
      skills: provider.skills,
      languages: provider.languages,
      socialLinks: provider.socialLinks,
      rating: provider.rating,
      totalReviews: provider.totalReviews,
      totalServices: provider.totalServices,
      isVerified: provider.isVerified,
      responseTime: provider.responseTime,
      completedProjects: provider.completedProjects,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
        user: {
          id: provider.userId._id,
          email: provider.userId.email,
          firstName: provider.userId.firstName,
          lastName: provider.userId.lastName,
          isVerified: provider.userId.isVerified,
          createdAt: provider.userId.createdAt,
          lastActive: provider.userId.lastActive
        }
      },
      services,
      statusStats
    });
  } catch (error) {
    console.error("Error getting provider details for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve or reject provider
export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, feedback } = req.body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved', 'rejected', or 'suspended'" });
    }

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Update provider status and feedback
    provider.status = status;
    if (reason) {
      provider.rejectionReason = reason;
    }
    if (feedback) {
      provider.adminFeedback = feedback;
    }
    provider.statusUpdatedAt = new Date();
    await provider.save();

    // If approved, also verify the user
    if (status === 'approved') {
      await User.findByIdAndUpdate(provider.userId, { isVerified: true });
    }

    // Populate user data for response
    const updatedProvider = await provider.populate('userId', 'email firstName lastName isVerified');

    res.status(200).json({
      message: `Provider ${status} successfully`,
      provider: {
        id: updatedProvider._id,
        name: updatedProvider.name,
        status: updatedProvider.status,
        adminFeedback: updatedProvider.adminFeedback,
        statusUpdatedAt: updatedProvider.statusUpdatedAt,
        user: {
          id: updatedProvider.userId._id,
          email: updatedProvider.userId.email,
          firstName: updatedProvider.userId.firstName,
          lastName: updatedProvider.userId.lastName,
          isVerified: updatedProvider.userId.isVerified
        }
      }
    });
  } catch (error) {
    console.error("Error updating provider status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get admin dashboard statistics
export const getAdminDashboardStats = async (req, res) => {
  try {
    // Get provider status counts
    const providerStats = await Provider.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total counts
    const totalProviders = await Provider.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalArtworks = await Artwork.countDocuments();
    const totalTutorials = await Tutorial.countDocuments();

    // Get recent activity
    const recentProviders = await Provider.find()
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get pending providers count
    const pendingProviders = await Provider.countDocuments({ status: 'pending' });

    // Get artwork stats
    const publicArtworks = await Artwork.countDocuments({ isPublic: true });
    const privateArtworks = await Artwork.countDocuments({ isPublic: false });

    // Get tutorial stats
    const publishedTutorials = await Tutorial.countDocuments({ isPublished: true });
    const draftTutorials = await Tutorial.countDocuments({ isPublished: false });

    const stats = {
      providers: {
        total: totalProviders,
        pending: pendingProviders,
        approved: providerStats.find(s => s._id === 'approved')?.count || 0,
        rejected: providerStats.find(s => s._id === 'rejected')?.count || 0,
        suspended: providerStats.find(s => s._id === 'suspended')?.count || 0
      },
      users: {
        total: totalUsers,
        clients: await User.countDocuments({ role: 'user' }),
        providers: await User.countDocuments({ role: 'provider' }),
        admins: await User.countDocuments({ role: 'admin' })
      },
      services: {
        total: totalServices,
        active: await Service.countDocuments({ isActive: true })
      },
      artworks: {
        total: totalArtworks,
        public: publicArtworks,
        private: privateArtworks
      },
      tutorials: {
        total: totalTutorials,
        published: publishedTutorials,
        draft: draftTutorials
      },
      recentProviders: recentProviders.map(p => ({
        id: p._id,
        name: p.name,
        status: p.status,
        createdAt: p.createdAt,
        user: {
          email: p.userId.email,
          firstName: p.userId.firstName,
          lastName: p.userId.lastName
        }
      }))
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting admin dashboard stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete provider (admin only)
export const deleteProviderByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Delete all services associated with this provider
    await Service.deleteMany({ providerId: id });

    // Update user role back to client
    await User.findByIdAndUpdate(provider.userId, { role: 'client' });

    // Delete the provider
    await provider.deleteOne();

    res.status(200).json({ message: "Provider and associated services deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}; 

// Get all users for admin management
export const getAllUsersForAdmin = async (req, res) => {
  try {
    const {
      role,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: page * limit < totalUsers,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error getting users for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user status (suspend/activate)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from suspending themselves
    if (user.role === 'admin' && req.user.id === id) {
      return res.status(400).json({ message: "Cannot suspend your own admin account" });
    }

    user.isActive = isActive;
    if (reason) {
      user.suspensionReason = reason;
    }
    user.statusUpdatedAt = new Date();
    await user.save();

    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        suspensionReason: user.suspensionReason,
        statusUpdatedAt: user.statusUpdatedAt
      }
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user (admin only)
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // Delete user's artworks
    await Artwork.deleteMany({ artist: id });

    // Delete user's tutorials
    await Tutorial.deleteMany({ author: id });

    // Delete user's comments
    await Comment.deleteMany({ user: id });

    // Delete user's messages
    await Message.deleteMany({ 
      $or: [
        { sender: id },
        { recipient: id }
      ]
    });

    // Delete user's chats
    await Chat.deleteMany({
      participants: id
    });

    // Delete the user
    await user.deleteOne();

    res.status(200).json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single user details for admin
export const getUserDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user details (admin only)
export const updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, username, bio, location, website, phone } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    // Update user fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user statistics for admin
export const getUserStatsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's artworks count
    const artworksCount = await Artwork.countDocuments({ artist: id });

    // Get user's tutorials count
    const tutorialsCount = await Tutorial.countDocuments({ author: id });

    // Get user's followers count (if you have a followers system)
    const followersCount = 0; // Placeholder - implement if you have followers

    // Get user's following count (if you have a following system)
    const followingCount = 0; // Placeholder - implement if you have following

    // Get total likes on user's artworks
    const artworks = await Artwork.find({ artist: id }).select('likes');
    const totalLikes = artworks.reduce((sum, artwork) => sum + (artwork.likes || 0), 0);

    res.status(200).json({
      artworks: artworksCount,
      tutorials: tutorialsCount,
      followers: followersCount,
      following: followingCount,
      totalLikes,
      lastActive: user.lastActive
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all artworks for admin management
export const getAllArtworksForAdmin = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.isPublic = status === 'public';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const artworks = await Artwork.find(filter)
      .populate('artist', 'username profileImage firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalArtworks = await Artwork.countDocuments(filter);

    res.status(200).json({
      artworks,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalArtworks / limit),
        totalArtworks,
        hasNextPage: page * limit < totalArtworks,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error getting artworks for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update artwork status (public/private)
export const updateArtworkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic, reason } = req.body;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    artwork.isPublic = isPublic;
    if (reason) {
      artwork.adminNote = reason;
    }
    artwork.statusUpdatedAt = new Date();
    await artwork.save();

    res.status(200).json({
      message: `Artwork ${isPublic ? 'made public' : 'made private'} successfully`,
      artwork: {
        id: artwork._id,
        title: artwork.title,
        isPublic: artwork.isPublic,
        adminNote: artwork.adminNote,
        statusUpdatedAt: artwork.statusUpdatedAt
      }
    });
  } catch (error) {
    console.error("Error updating artwork status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete artwork (admin only)
export const deleteArtworkByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Delete the artwork
    await artwork.deleteOne();

    // Update user's artwork count
    await User.findByIdAndUpdate(artwork.artist, { $inc: { artworksCount: -1 } });

    res.status(200).json({ message: "Artwork deleted successfully" });
  } catch (error) {
    console.error("Error deleting artwork:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single artwork details for admin
export const getArtworkDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findById(id)
      .populate('artist', 'username profileImage firstName lastName email bio location website');
    
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    res.status(200).json(artwork);
  } catch (error) {
    console.error("Error getting artwork details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update artwork details (admin only)
export const updateArtworkDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, isPublic, adminNote } = req.body;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Update artwork fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('artist', 'username profileImage firstName lastName email bio location website');

    res.status(200).json(updatedArtwork);
  } catch (error) {
    console.error("Error updating artwork details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create tutorial
export const createTutorial = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      tags,
      difficulty,
      estimatedTime,
      materials,
      steps,
      isPublished = false
    } = req.body;

    // Normalize array-like fields from either JSON, CSV, or arrays
    const normalizeStringArray = (value) => {
      if (Array.isArray(value)) return value.filter(Boolean).map(v => String(v).trim()).filter(Boolean);
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        // If looks like JSON, parse it
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') || trimmed.startsWith('{'))) {
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [];
          } catch (_) {
            // fall through to CSV split
          }
        }
        return trimmed.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    };

    const normalizeSteps = (value) => {
      let arr = [];
      if (Array.isArray(value)) {
        arr = value;
      } else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          arr = Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          arr = [];
        }
      }
      return arr.map((s, idx) => ({
        title: s.title || '',
        description: s.description || '',
        imageUrl: s.imageUrl || '',
        order: typeof s.order === 'number' ? s.order : (idx + 1)
      }));
    };

    const tutorialData = {
      title,
      description,
      content,
      category,
      tags: normalizeStringArray(tags),
      difficulty,
      estimatedTime: parseInt(estimatedTime, 10) || 30,
      materials: normalizeStringArray(materials),
      steps: normalizeSteps(steps),
      author: req.user.id,
      isPublished,
      thumbnail: req.file ? `/uploads/tutorials/${req.file.filename}` : ""
    };

    const tutorial = new Tutorial(tutorialData);
    await tutorial.save();

    res.status(201).json({
      message: "Tutorial created successfully",
      tutorial
    });
  } catch (error) {
    console.error("Error creating tutorial:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all tutorials
export const getAllTutorials = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      isPublished,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const tutorials = await Tutorial.find(filter)
      .populate('author', 'username profileImage firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalTutorials = await Tutorial.countDocuments(filter);

    res.status(200).json({
      tutorials,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalTutorials / limit),
        totalTutorials,
        hasNextPage: page * limit < totalTutorials,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error getting tutorials:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update tutorial
export const updateTutorial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Parse JSON fields if they exist
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }
    if (updateData.materials) {
      updateData.materials = JSON.parse(updateData.materials);
    }
    if (updateData.steps) {
      updateData.steps = JSON.parse(updateData.steps);
    }

    // Update thumbnail if new file uploaded
    if (req.file) {
      updateData.thumbnail = `/uploads/tutorials/${req.file.filename}`;
    }

    const updatedTutorial = await Tutorial.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('author', 'username profileImage firstName lastName');

    res.status(200).json({
      message: "Tutorial updated successfully",
      tutorial: updatedTutorial
    });
  } catch (error) {
    console.error("Error updating tutorial:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete tutorial
export const deleteTutorial = async (req, res) => {
  try {
    const { id } = req.params;

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    await tutorial.deleteOne();

    res.status(200).json({ message: "Tutorial deleted successfully" });
  } catch (error) {
    console.error("Error deleting tutorial:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}; 