import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllProvidersForAdmin,
  getProviderDetailsForAdmin,
  updateProviderStatus,
  getAdminDashboardStats,
  deleteProviderByAdmin,
  // New admin functions
  getAllUsersForAdmin,
  updateUserStatus,
  deleteUserByAdmin,
  getUserDetailsForAdmin,
  updateUserDetails,
  getUserStatsForAdmin,
  getAllArtworksForAdmin,
  updateArtworkStatus,
  deleteArtworkByAdmin,
  getArtworkDetailsForAdmin,
  updateArtworkDetails,
  getTutorialDetailsForAdmin,
  createTutorial,
  getAllTutorials,
  updateTutorial,
  deleteTutorial,
  updateTutorialStatus
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Configure multer for tutorial uploads
const tutorialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tutorials/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const tutorialUpload = multer({ 
  storage: tutorialStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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

// User management
router.get("/users", getAllUsersForAdmin);
router.get("/users/:id", getUserDetailsForAdmin);
router.patch("/users/:id", updateUserDetails);
router.patch("/users/:id/status", updateUserStatus);
router.get("/users/:id/stats", getUserStatsForAdmin);
router.delete("/users/:id", deleteUserByAdmin);

// Artwork management
router.get("/artworks", getAllArtworksForAdmin);
router.get("/artworks/:id", getArtworkDetailsForAdmin);
router.patch("/artworks/:id", updateArtworkDetails);
router.patch("/artworks/:id/status", updateArtworkStatus);
router.delete("/artworks/:id", deleteArtworkByAdmin);

// Tutorial management
router.post("/tutorials", tutorialUpload.single('thumbnail'), createTutorial);
router.get("/tutorials", getAllTutorials);
router.get("/tutorials/:id", getTutorialDetailsForAdmin);
router.put("/tutorials/:id", tutorialUpload.single('thumbnail'), updateTutorial);
router.patch("/tutorials/:id/status", updateTutorialStatus);
router.delete("/tutorials/:id", deleteTutorial);

export default router; 