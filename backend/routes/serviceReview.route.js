import express from "express";
import {
  getAllServiceReviews,
  createServiceReview,
  updateServiceReview,
  deleteServiceReview,
} from "../controllers/serviceReview.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:serviceId", getAllServiceReviews);
router.post("/:serviceId", protect, createServiceReview);
router.put("/:reviewId", protect, updateServiceReview);
router.delete("/:reviewId", protect, deleteServiceReview);

export default router;
