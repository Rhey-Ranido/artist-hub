import express from "express";
import {
  getAllProvidersForAdmin,
  getProviderDetailsForAdmin,
  updateProviderStatus,
  getAdminDashboardStats,
  deleteProviderByAdmin,
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo("admin"));

// Dashboard statistics
router.get("/dashboard/stats", getAdminDashboardStats);

// Provider management
router.get("/providers", getAllProvidersForAdmin);
router.get("/providers/:id", getProviderDetailsForAdmin);
router.patch("/providers/:id/status", updateProviderStatus);
router.delete("/providers/:id", deleteProviderByAdmin);

export default router; 