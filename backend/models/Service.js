import mongoose from "mongoose";
const { Schema } = mongoose;

// Import the ServiceReview model to avoid circular dependency issues
import ServiceReview from "./ServiceReview.js";

const serviceSchema = new Schema(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String }, // For card previews
    price: { 
      amount: { type: Number, required: true },
      unit: { type: String, enum: ["hour", "project", "day", "week", "month"], default: "hour" }
    },
    category: { 
      type: String, 
      required: true,
      enum: ["Technology", "Marketing", "Design", "Writing", "Business", "Other"]
    },
    tags: [{ type: String }],
    images: [{ type: String }], // Array of image URLs
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    deliveryTime: { type: String }, // "3-5 days", "1 week"
    revisions: { type: Number, default: 1 },
    requirements: [{ type: String }], // What client needs to provide
    faqs: [{
      question: String,
      answer: String
    }],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalOrders: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    packages: [{
      name: { type: String, required: true }, // "Basic", "Standard", "Premium"
      description: String,
      price: { type: Number, required: true },
      deliveryTime: String,
      revisions: Number,
      features: [String]
    }],
  },
  { timestamps: true }
);

// Static method to update service rating statistics
serviceSchema.statics.updateRatingStats = async function(serviceId) {
  const reviews = await ServiceReview.find({ serviceId });
  const count = reviews.length;
  const average = count > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / count 
    : 0;
  
  await this.findByIdAndUpdate(serviceId, {
    'rating.average': Math.round(average * 10) / 10, // Round to 1 decimal place
    'rating.count': count
  });
  
  return { average: Math.round(average * 10) / 10, count };
};

// Static method to update all service ratings (for data migration)
serviceSchema.statics.updateAllRatingStats = async function() {
  const services = await this.find({});
  const results = [];
  
  for (const service of services) {
    const result = await this.updateRatingStats(service._id);
    results.push({ serviceId: service._id, ...result });
  }
  
  return results;
};

export default mongoose.model("Service", serviceSchema);
