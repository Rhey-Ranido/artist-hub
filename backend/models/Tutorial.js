import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced", "technique", "inspiration"],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    thumbnail: {
      type: String,
      required: false,
    },
    videoUrl: {
      type: String,
      required: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      type: { 
        type: String, 
        enum: ["like", "heart", "star", "bookmark"], 
        default: "like" 
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    reactionsCount: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 30,
    },
    materials: [{
      type: String,
      trim: true,
    }],
    steps: [{
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
        required: false,
      },
      order: {
        type: Number,
        required: true,
      },
    }],
  },
  { timestamps: true }
);

// Index for better search performance
tutorialSchema.index({ title: "text", description: "text", tags: "text" });

// Update reactions count when reactions array changes
tutorialSchema.pre('save', function(next) {
  this.reactionsCount = this.reactions.length;
  next();
});

// Static method to update reaction count
tutorialSchema.statics.updateReactionCount = async function(tutorialId) {
  const tutorial = await this.findById(tutorialId);
  if (tutorial) {
    tutorial.reactionsCount = tutorial.reactions.length;
    await tutorial.save();
  }
};

export default mongoose.model("Tutorial", tutorialSchema);

