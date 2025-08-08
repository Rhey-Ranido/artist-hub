import Tutorial from "../models/Tutorial.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Get all published tutorials
export const getPublishedTutorials = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", difficulty = "" } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user?.id; // Get user ID if authenticated

    // Build filter for published tutorials only
    const filter = { isPublished: true };

    // Add search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Add difficulty filter
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const tutorials = await Tutorial.find(filter)
      .populate('author', 'username profileImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add user reaction status to each tutorial
    const tutorialsWithReactions = tutorials.map(tutorial => {
      const tutorialObj = tutorial.toObject();
      
      // Check if current user has reacted to this tutorial
      if (userId) {
        const userReaction = tutorial.reactions.find(
          reaction => reaction.user.toString() === userId
        );
        tutorialObj.userReaction = userReaction ? userReaction.type : null;
        tutorialObj.isReacted = !!userReaction;
      } else {
        tutorialObj.userReaction = null;
        tutorialObj.isReacted = false;
      }
      
      return tutorialObj;
    });

    // Add completion status for authenticated users
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.completedTutorials) {
        tutorialsWithReactions.forEach(tutorial => {
          tutorial.isCompleted = user.completedTutorials.includes(tutorial._id.toString());
        });
      }
    }

    const totalTutorials = await Tutorial.countDocuments(filter);

    return res.status(200).json({
      tutorials: tutorialsWithReactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTutorials / limit),
        totalTutorials,
        hasNextPage: page * limit < totalTutorials,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error getting published tutorials:", error);
    return res.status(500).json({ message: "Failed to fetch tutorials" });
  }
};

// Get single tutorial details (public)
export const getTutorialDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Get user ID if authenticated

    console.log('Fetching tutorial with ID:', id);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return res.status(400).json({ message: "Invalid tutorial ID format" });
    }

    const tutorial = await Tutorial.findById(id)
      .populate('author', 'username profileImageUrl');

    if (!tutorial) {
      console.log('Tutorial not found for ID:', id);
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Only return published tutorials for public access
    if (!tutorial.isPublished) {
      console.log('Tutorial not published for ID:', id);
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Add user reaction status to the tutorial
    const tutorialObj = tutorial.toObject();
    if (userId) {
      const userReaction = tutorial.reactions.find(
        reaction => reaction.user.toString() === userId
      );
      tutorialObj.userReaction = userReaction ? userReaction.type : null;
      tutorialObj.isReacted = !!userReaction;
      
      // Check if user has completed this tutorial
      const user = await User.findById(userId);
      if (user && user.completedTutorials) {
        tutorialObj.isCompleted = user.completedTutorials.includes(id);
      } else {
        tutorialObj.isCompleted = false;
      }
    } else {
      tutorialObj.userReaction = null;
      tutorialObj.isReacted = false;
      tutorialObj.isCompleted = false;
    }

    console.log('Successfully fetched tutorial:', tutorialObj.title);
    return res.status(200).json(tutorialObj);
  } catch (error) {
    console.error("Error getting tutorial details:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ message: "Failed to fetch tutorial details" });
  }
};

// Get tutorial categories
export const getTutorialCategories = async (req, res) => {
  try {
    const categories = await Tutorial.distinct('category', { isPublished: true });
    const difficulties = await Tutorial.distinct('difficulty', { isPublished: true });

    return res.status(200).json({
      categories,
      difficulties
    });
  } catch (error) {
    console.error("Error getting tutorial categories:", error);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Get tutorial difficulties only
export const getTutorialDifficulties = async (req, res) => {
  try {
    const difficulties = await Tutorial.distinct('difficulty', { isPublished: true });

    return res.status(200).json({
      difficulties
    });
  } catch (error) {
    console.error("Error getting tutorial difficulties:", error);
    return res.status(500).json({ message: "Failed to fetch difficulties" });
  }
};

// React to tutorial (like, heart, star, bookmark)
export const toggleTutorialReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type = "like" } = req.body; // like, heart, star, bookmark

    if (!["like", "heart", "star", "bookmark"].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Check if user already reacted to this tutorial
    const existingReactionIndex = tutorial.reactions.findIndex(
      reaction => reaction.user.toString() === userId && reaction.type === type
    );

    let action;
    if (existingReactionIndex > -1) {
      // Remove reaction
      tutorial.reactions.splice(existingReactionIndex, 1);
      action = "removed";
    } else {
      // Add reaction
      tutorial.reactions.push({ user: userId, type });
      action = "added";
    }

    tutorial.reactionsCount = tutorial.reactions.length;
    await tutorial.save();

    return res.status(200).json({
      message: `Reaction ${action} successfully`,
      reactionsCount: tutorial.reactionsCount,
      isReacted: action === "added"
    });
  } catch (error) {
    console.error("Toggle tutorial reaction error:", error);
    return res.status(500).json({ 
      message: "Failed to toggle tutorial reaction" 
    });
  }
};

// Complete tutorial and update user level
export const completeTutorial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Check if user has already completed this tutorial
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has already completed this tutorial
    if (user.completedTutorials && user.completedTutorials.includes(id)) {
      return res.status(400).json({ 
        message: "Tutorial already completed",
        isCompleted: true 
      });
    }

    // Add tutorial to user's completed tutorials
    if (!user.completedTutorials) {
      user.completedTutorials = [];
    }
    user.completedTutorials.push(id);

    // Check if user should level up based on their current level
    let levelUp = false;
    let newLevel = user.level;
    let levelUpMessage = "";

    if (user.level === 'beginner') {
      // Count beginner tutorials completed
      const completedBeginnerTutorials = await Tutorial.find({
        _id: { $in: user.completedTutorials },
        difficulty: 'beginner'
      });

      if (completedBeginnerTutorials.length >= 5) {
        user.level = 'intermediate';
        newLevel = 'intermediate';
        levelUp = true;
        levelUpMessage = "🎉 Congratulations! You've completed 5 beginner tutorials and leveled up to Intermediate! You can now access intermediate tutorials.";
      }
    } else if (user.level === 'intermediate') {
      // Count intermediate tutorials completed
      const completedIntermediateTutorials = await Tutorial.find({
        _id: { $in: user.completedTutorials },
        difficulty: 'intermediate'
      });

      if (completedIntermediateTutorials.length >= 5) {
        user.level = 'advanced';
        newLevel = 'advanced';
        levelUp = true;
        levelUpMessage = "🎉 Amazing! You've completed 5 intermediate tutorials and leveled up to Advanced! You can now access advanced tutorials.";
      }
    }

    await user.save();

    if (levelUp) {
      return res.status(200).json({
        message: levelUpMessage,
        isCompleted: true,
        levelUp: true,
        newLevel: newLevel,
        completedTutorialsCount: user.completedTutorials.length,
        levelUpMessage: levelUpMessage
      });
    }

    return res.status(200).json({
      message: "Tutorial completed successfully!",
      isCompleted: true,
      completedTutorialsCount: user.completedTutorials.length
    });

  } catch (error) {
    console.error("Complete tutorial error:", error);
    return res.status(500).json({ 
      message: "Failed to complete tutorial" 
    });
  }
};

// Get tutorials accessible to user based on their level
export const getAccessibleTutorials = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 12, search = "", difficulty = "" } = req.query;
    const skip = (page - 1) * limit;

    // Get user's current level
    let userLevel = 'beginner';
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userLevel = user.level;
      }
    }

    // Build filter for published tutorials
    const filter = { isPublished: true };

    // Filter tutorials based on user's level
    const levelAccess = {
      'beginner': ['beginner'],
      'intermediate': ['beginner', 'intermediate'],
      'advanced': ['beginner', 'intermediate', 'advanced']
    };

    filter.difficulty = { $in: levelAccess[userLevel] || ['beginner'] };

    // Add search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Add difficulty filter if specified
    if (difficulty && difficulty !== 'all') {
      // Only allow access to tutorials within user's level
      if (levelAccess[userLevel].includes(difficulty)) {
        filter.difficulty = difficulty;
      }
    }

    const tutorials = await Tutorial.find(filter)
      .populate('author', 'username profileImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add user reaction and completion status
    const tutorialsWithUserData = tutorials.map(tutorial => {
      const tutorialObj = tutorial.toObject();
      
      if (userId) {
        const userReaction = tutorial.reactions.find(
          reaction => reaction.user.toString() === userId
        );
        tutorialObj.userReaction = userReaction ? userReaction.type : null;
        tutorialObj.isReacted = !!userReaction;
      } else {
        tutorialObj.userReaction = null;
        tutorialObj.isReacted = false;
      }
      
      return tutorialObj;
    });

    // Add completion status for authenticated users
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.completedTutorials) {
        tutorialsWithUserData.forEach(tutorial => {
          tutorial.isCompleted = user.completedTutorials.includes(tutorial._id.toString());
        });
      }
    }

    const totalTutorials = await Tutorial.countDocuments(filter);

    return res.status(200).json({
      tutorials: tutorialsWithUserData,
      userLevel: userLevel,
      accessibleLevels: levelAccess[userLevel] || ['beginner'],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTutorials / limit),
        totalTutorials,
        hasNextPage: page * limit < totalTutorials,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error getting accessible tutorials:", error);
    return res.status(500).json({ message: "Failed to fetch tutorials" });
  }
};
