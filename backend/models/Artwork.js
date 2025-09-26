import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
      required: false,
      default: "",
    },
    imageData: {
      type: String, // Base64 encoded image data
      required: false,
    },
    canvasData: {
      type: String, // JSON string of canvas data for editing
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 30,
    }],
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { type: String, enum: ["like", "heart", "star"], default: "like" },
      createdAt: { type: Date, default: Date.now }
    }],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      viewedAt: { type: Date, default: Date.now }
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    adminNote: {
      type: String,
      default: "",
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    tools: [{
      type: String, // brush, pencil, eraser, etc.
    }],
    colors: [{
      type: String, // hex color codes used
    }],
  },
  { timestamps: true }
);

// Index for better query performance
artworkSchema.index({ artist: 1, createdAt: -1 });
artworkSchema.index({ tags: 1 });
artworkSchema.index({ title: "text", description: "text", tags: "text" });
artworkSchema.index({ likesCount: -1 });
artworkSchema.index({ createdAt: -1 });

// Static method to update like count
artworkSchema.statics.updateLikeCount = async function(artworkId) {
  const artwork = await this.findById(artworkId);
  if (artwork) {
    artwork.likesCount = artwork.likes.length;
    await artwork.save();
  }
};

export default mongoose.model("Artwork", artworkSchema);