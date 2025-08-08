import Artwork from "../models/Artwork.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { createNotification } from "./notification.controller.js";
import fs from "fs";
import path from "path";

// Create new artwork
export const createArtwork = async (req, res) => {
  try {
    const { title, description, canvasData, tags, dimensions, tools, colors, isPublic } = req.body;
    const userId = req.user.id;

    console.log("Received artwork data:", { title, description, canvasData: canvasData ? "present" : "missing", tags, dimensions, tools, colors, isPublic });

    // Validate required fields
    if (!title || !canvasData || !dimensions) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, canvas data, and dimensions are required" 
      });
    }

    // Parse JSON strings from FormData
    let parsedTags = [];
    let parsedDimensions = {};
    let parsedTools = [];
    let parsedColors = [];

    try {
      parsedTags = tags ? JSON.parse(tags) : [];
      parsedDimensions = dimensions ? JSON.parse(dimensions) : {};
      parsedTools = tools ? JSON.parse(tools) : [];
      parsedColors = colors ? JSON.parse(colors) : [];
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid JSON format in request data" 
      });
    }

    // Create artwork with image URL if uploaded
    const artworkData = {
      title,
      description: description || "",
      canvasData,
      tags: parsedTags,
      artist: userId,
      dimensions: parsedDimensions,
      tools: parsedTools,
      colors: parsedColors,
      isPublic: isPublic === 'true' || isPublic === true,
      imageUrl: req.file ? `/uploads/artworks/${req.file.filename}` : ""
    };

    const artwork = new Artwork(artworkData);
    await artwork.save();

    // Update user's artwork count
    await User.findByIdAndUpdate(userId, { $inc: { artworksCount: 1 } });

    // Populate artist info for response
    await artwork.populate('artist', 'username profileImage');

    res.status(201).json({
      success: true,
      message: "Artwork created successfully",
      artwork
    });
  } catch (error) {
    console.error("Create artwork error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create artwork" 
    });
  }
};

// Get artwork feed (public artworks)
export const getArtworkFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const artworks = await Artwork.find({ isPublic: true })
      .populate('artist', 'username profileImage firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Construct full URLs for artwork images
    const host = req.get('host') || 'localhost:5000';
    const artworksWithUrls = artworks.map(artwork => ({
      ...artwork,
      imageUrl: artwork.imageUrl ? `${req.protocol}://${host}${artwork.imageUrl}` : null,
      canvasData: artwork.canvasData ? `${req.protocol}://${host}${artwork.canvasData}` : null
    }));

    const total = await Artwork.countDocuments({ isPublic: true });

    res.json({
      success: true,
      artworks: artworksWithUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArtworks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get artwork feed error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch artwork feed" 
    });
  }
};

// Get single artwork by ID
export const getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const artwork = await Artwork.findById(id)
      .populate('artist', 'username profileImage bio')
      .lean();

    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        message: "Artwork not found" 
      });
    }

    // Increment view count
    await Artwork.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      artwork
    });
  } catch (error) {
    console.error("Get artwork error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch artwork" 
    });
  }
};

// Get user's artworks by ID or username
export const getUserArtworks = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Check if userId is a valid ObjectId (MongoDB ID)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    
    let user;
    if (isObjectId) {
      // Search by ID
      user = await User.findById(userId);
    } else {
      // Search by username
      user = await User.findOne({ username: userId });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const query = { artist: user._id };
    
    // If not the owner, only show public artworks
    if (req.user?.id !== user._id.toString()) {
      query.isPublic = true;
    }

    const artworks = await Artwork.find(query)
      .populate('artist', 'username profileImage firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Construct full URLs for artwork images
    const host = req.get('host') || 'localhost:5000';
    const artworksWithUrls = artworks.map(artwork => ({
      ...artwork,
      imageUrl: artwork.imageUrl ? `${req.protocol}://${host}${artwork.imageUrl}` : null,
      canvasData: artwork.canvasData ? `${req.protocol}://${host}${artwork.canvasData}` : null
    }));

    const total = await Artwork.countDocuments(query);

    res.json({
      success: true,
      artworks: artworksWithUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArtworks: total
      }
    });
  } catch (error) {
    console.error("Get user artworks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch user artworks" 
    });
  }
};

// Update artwork
export const updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, isPublic } = req.body;
    const userId = req.user.id;

    const artwork = await Artwork.findById(id);
    
    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        message: "Artwork not found" 
      });
    }

    // Check if user owns the artwork
    if (artwork.artist.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own artworks" 
      });
    }

    // Update fields
    if (title !== undefined) artwork.title = title;
    if (description !== undefined) artwork.description = description;
    if (tags !== undefined) artwork.tags = tags;
    if (isPublic !== undefined) artwork.isPublic = isPublic;

    await artwork.save();
    await artwork.populate('artist', 'username profileImage');

    res.json({
      success: true,
      message: "Artwork updated successfully",
      artwork
    });
  } catch (error) {
    console.error("Update artwork error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update artwork" 
    });
  }
};

// Delete artwork
export const deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const artwork = await Artwork.findById(id);
    
    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        message: "Artwork not found" 
      });
    }

    // Check if user owns the artwork or is admin
    if (artwork.artist.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own artworks" 
      });
    }

    // Delete image file if exists
    if (artwork.imageUrl) {
      const imagePath = path.join(process.cwd(), artwork.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete all comments for this artwork
    await Comment.deleteMany({ artwork: id });

    // Delete the artwork
    await Artwork.findByIdAndDelete(id);

    // Update user's artwork count
    await User.findByIdAndUpdate(artwork.artist, { $inc: { artworksCount: -1 } });

    res.json({
      success: true,
      message: "Artwork deleted successfully"
    });
  } catch (error) {
    console.error("Delete artwork error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete artwork" 
    });
  }
};

// Like/Unlike artwork
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "like" } = req.body; // like, heart, star
    const userId = req.user.id;

    const artwork = await Artwork.findById(id);
    
    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        message: "Artwork not found" 
      });
    }

    // Check if user already liked this artwork
    const existingLikeIndex = artwork.likes.findIndex(
      like => like.user.toString() === userId
    );

    let action;
    if (existingLikeIndex > -1) {
      // Remove like
      artwork.likes.splice(existingLikeIndex, 1);
      action = "unliked";
    } else {
      // Add like
      artwork.likes.push({ user: userId, type });
      action = "liked";
    }

    artwork.likesCount = artwork.likes.length;
    await artwork.save();

    // Update artist's total likes received
    if (action === "liked") {
      await User.findByIdAndUpdate(artwork.artist, { $inc: { likesReceived: 1 } });
      // Create notification for the artist
      await createNotification(artwork.artist, userId, artwork._id, "like");
    } else {
      await User.findByIdAndUpdate(artwork.artist, { $inc: { likesReceived: -1 } });
    }

    res.json({
      success: true,
      message: `Artwork ${action}`,
      likesCount: artwork.likesCount,
      isLiked: action === "liked"
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to toggle like" 
    });
  }
};

// Search artworks
export const searchArtworks = async (req, res) => {
  try {
    const { query, tags, artist, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let searchQuery = { isPublic: true };

    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      searchQuery.tags = { $in: tagArray };
    }

    // Filter by artist
    if (artist) {
      searchQuery.artist = artist;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const artworks = await Artwork.find(searchQuery)
      .populate('artist', 'username profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Artwork.countDocuments(searchQuery);

    res.json({
      success: true,
      artworks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArtworks: total
      }
    });
  } catch (error) {
    console.error("Search artworks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to search artworks" 
    });
  }
};

// Save/Unsave artwork
export const toggleSaveArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const artwork = await Artwork.findById(id);
    
    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        message: "Artwork not found" 
      });
    }

    const user = await User.findById(userId);
    const savedIndex = user.savedArtworks.indexOf(id);

    let action;
    if (savedIndex > -1) {
      // Remove from saved
      user.savedArtworks.splice(savedIndex, 1);
      action = "unsaved";
    } else {
      // Add to saved
      user.savedArtworks.push(id);
      action = "saved";
    }

    await user.save();

    res.json({
      success: true,
      message: `Artwork ${action}`,
      isSaved: action === "saved"
    });
  } catch (error) {
    console.error("Toggle save artwork error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to toggle save artwork" 
    });
  }
};

// Get user's saved artworks
export const getSavedArtworks = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).populate({
      path: 'savedArtworks',
      populate: {
        path: 'artist',
        select: 'username profileImage firstName lastName'
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Get saved artworks with pagination
    const savedArtworks = user.savedArtworks.slice(skip, skip + limit);
    const total = user.savedArtworks.length;

    // Construct full URLs for artwork images
    const host = req.get('host') || 'localhost:5000';
    const artworksWithUrls = savedArtworks.map(artwork => ({
      ...artwork.toObject(),
      imageUrl: artwork.imageUrl ? `${req.protocol}://${host}${artwork.imageUrl}` : null,
      canvasData: artwork.canvasData ? `${req.protocol}://${host}${artwork.canvasData}` : null
    }));

    res.json({
      success: true,
      artworks: artworksWithUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArtworks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get saved artworks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch saved artworks" 
    });
  }
};

// Get user's posted artworks
export const getPostedArtworks = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const isPublic = req.query.isPublic; // New filter parameter

    let query = { artist: userId };
    
    // Add isPublic filter if provided
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const artworks = await Artwork.find(query)
      .populate('artist', 'username profileImage firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Construct full URLs for artwork images
    const host = req.get('host') || 'localhost:5000';
    const artworksWithUrls = artworks.map(artwork => ({
      ...artwork,
      imageUrl: artwork.imageUrl ? `${req.protocol}://${host}${artwork.imageUrl}` : null,
      canvasData: artwork.canvasData ? `${req.protocol}://${host}${artwork.canvasData}` : null
    }));

    const total = await Artwork.countDocuments(query);

    res.json({
      success: true,
      artworks: artworksWithUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalArtworks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get posted artworks error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch posted artworks" 
    });
  }
};