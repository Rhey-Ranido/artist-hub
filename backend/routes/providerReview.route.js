import express from "express";
import {
  getAllProviderReviews,
  createProviderReview,
  updateProviderReview,
  deleteProviderReview,
} from "../controllers/providerReview.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:providerId", getAllProviderReviews); // Public
router.post("/:providerId", protect, createProviderReview);
router.put("/:reviewId", protect, updateProviderReview);
router.delete("/:reviewId", protect, deleteProviderReview);

export default router;
