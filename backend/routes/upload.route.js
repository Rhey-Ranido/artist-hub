import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingle, uploadMultiple } from "../utils/uploadConfig.js";
import {
  uploadUserProfileImage,
  uploadProviderProfileImage,
  uploadServiceImages,
  deleteServiceImage,
  getImageUrls
} from "../controllers/upload.controller.js";

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// User profile image upload
router.post("/profile/user", uploadSingle('profile'), uploadUserProfileImage);

// Provider profile image upload
router.post("/profile/provider", uploadSingle('profile'), uploadProviderProfileImage);

// Service images upload (multiple files)
router.post("/service/:serviceId", uploadMultiple('service', 5), uploadServiceImages);

// Delete service image
router.delete("/service/:serviceId/image/:imageIndex", deleteServiceImage);

// Utility route (placeholder)
router.get("/urls/:type/:id", getImageUrls);

export default router; 