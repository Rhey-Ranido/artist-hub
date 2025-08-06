import Comment from "../models/Comment.js";
import Artwork from "../models/Artwork.js";

// Create new comment
export const createComment = async (req, res) => {
  try {
    const { content, artworkId, parentCommentId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!content || !artworkId) {
      return res.status(400).json({ 
        success: false, 
        message: "Content and artwork ID are required" 
      });
    }

    // Check if artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        message: "Artwork not found" 
      });
    }

    // If replying to a comment, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ 
          success: false, 
          message: "Parent comment not found" 
        });
      }
    }

    const comment = new Comment({
      content,
      author: userId,
      artwork: artworkId,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'username profileImage');

    // Update artwork's comment count
    await Artwork.findByIdAndUpdate(artworkId, { $inc: { commentsCount: 1 } });

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create comment" 
    });
  }
};

// Get comments for an artwork
export const getArtworkComments = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get top-level comments (no parent)
    const comments = await Comment.find({ 
      artwork: artworkId, 
      parentComment: null 
    })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'username profileImage')
          .sort({ createdAt: 1 })
          .lean();
        
        return {
          ...comment,
          replies
        };
      })
    );

    const total = await Comment.countDocuments({ 
      artwork: artworkId, 
      parentComment: null 
    });

    res.json({
      success: true,
      comments: commentsWithReplies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total
      }
    });
  } catch (error) {
    console.error("Get artwork comments error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch comments" 
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: "Content is required" 
      });
    }

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own comments" 
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    await comment.populate('author', 'username profileImage');

    res.json({
      success: true,
      message: "Comment updated successfully",
      comment
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update comment" 
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own comments" 
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: id });

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    // Update artwork's comment count
    const replyCount = await Comment.countDocuments({ parentComment: id });
    await Artwork.findByIdAndUpdate(comment.artwork, { 
      $inc: { commentsCount: -(1 + replyCount) } 
    });

    res.json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete comment" 
    });
  }
};

// Like/Unlike comment
export const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    const likeIndex = comment.likes.indexOf(userId);
    let action;

    if (likeIndex > -1) {
      // Remove like
      comment.likes.splice(likeIndex, 1);
      action = "unliked";
    } else {
      // Add like
      comment.likes.push(userId);
      action = "liked";
    }

    await comment.save();

    res.json({
      success: true,
      message: `Comment ${action}`,
      likesCount: comment.likesCount,
      isLiked: action === "liked"
    });
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to toggle comment like" 
    });
  }
};