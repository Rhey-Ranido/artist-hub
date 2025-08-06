import mongoose from "mongoose";
const { Schema } = mongoose;

const serviceReviewSchema = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

serviceReviewSchema.index({ serviceId: 1, userId: 1 }, { unique: true });


export default mongoose.model("ServiceReview", serviceReviewSchema);
