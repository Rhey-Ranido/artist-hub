import mongoose from "mongoose";
const { Schema } = mongoose;

// Import the ProviderReview model to avoid circular dependency issues
import ProviderReview from "./ProviderReview.js";

const providerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    bio: { type: String },
    profileImage: { type: String },
    location: {
      address: { type: String, required: true }, // "San Francisco, CA"
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalReviews: { type: Number, default: 0 },
    totalServices: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    rejectionReason: { type: String },
    adminFeedback: { type: String },
    statusUpdatedAt: { type: Date },
    categories: [{ type: String }], // ["Technology", "Marketing"]
    skills: [{ type: String }], // ["React", "Node.js", "SEO"]
    languages: [{ type: String }], // ["English", "Spanish"]
    responseTime: { type: String, default: "within 24 hours" },
    completedProjects: { type: Number, default: 0 },
    socialLinks: {
      website: String,
      linkedin: String,
      twitter: String,
      github: String,
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for location coordinates only (not the entire location object)
providerSchema.index({ "location": "2dsphere" });

// Static method to update provider rating statistics
providerSchema.statics.updateRatingStats = async function(providerId) {
  const reviews = await ProviderReview.find({ providerId });
  const count = reviews.length;
  const average = count > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / count 
    : 0;
  
  await this.findByIdAndUpdate(providerId, {
    'rating.average': Math.round(average * 10) / 10, // Round to 1 decimal place
    'rating.count': count,
    'totalReviews': count
  });
  
  return { average: Math.round(average * 10) / 10, count };
};

// Static method to update all provider ratings (for data migration)
providerSchema.statics.updateAllRatingStats = async function() {
  const providers = await this.find({});
  const results = [];
  
  for (const provider of providers) {
    const result = await this.updateRatingStats(provider._id);
    results.push({ providerId: provider._id, ...result });
  }
  
  return results;
};

// Static method to update provider's total services count
providerSchema.statics.updateTotalServices = async function(providerId) {
  const Service = mongoose.model('Service');
  const serviceCount = await Service.countDocuments({ 
    providerId: providerId,
    isActive: true 
  });
  
  await this.findByIdAndUpdate(providerId, {
    'totalServices': serviceCount
  });
  
  return serviceCount;
};

// Static method to update all providers' total services count
providerSchema.statics.updateAllTotalServices = async function() {
  const providers = await this.find({});
  const results = [];
  
  for (const provider of providers) {
    const serviceCount = await this.updateTotalServices(provider._id);
    results.push({ providerId: provider._id, totalServices: serviceCount });
  }
  
  return results;
};

export default mongoose.model("Provider", providerSchema);
