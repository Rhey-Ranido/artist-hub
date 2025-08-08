import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingle, uploadMultiple } from "../utils/uploadConfig.js";
import {
  uploadUserProfileImage,
  uploadProviderProfileImage,
  uploadServiceImages,
  deleteServiceImage,
  getImageUrls,
  uploadTutorialStepImage
} from "../controllers/upload.controller.js";

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// User profile image upload
router.post("/profile/user", uploadSingle('profile', 'image'), uploadUserProfileImage);

// Provider profile image upload
router.post("/profile/provider", uploadSingle('profile', 'image'), uploadProviderProfileImage);

// Service images upload (multiple files)
router.post("/service/:serviceId", uploadMultiple('service', 5), uploadServiceImages);

// Delete service image
router.delete("/service/:serviceId/image/:imageIndex", deleteServiceImage);

// Tutorial step image upload
router.post("/tutorials/step", uploadSingle('tutorial', 'image'), uploadTutorialStepImage);

// Utility route (placeholder)
router.get("/urls/:type/:id", getImageUrls);

export default router; 