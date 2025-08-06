// models/ProviderReview.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const providerReviewSchema = new Schema(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

providerReviewSchema.index({ providerId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ProviderReview", providerReviewSchema);
