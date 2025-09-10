import express from "express";
import { 
  createArtwork, 
  getArtworkFeed, 
  getArtworkById, 
  getUserArtworks,
  updateArtwork, 
  deleteArtwork, 
  toggleLike,
  searchArtworks,
  toggleSaveArtwork,
  getSavedArtworks,
  getPostedArtworks
} from "../controllers/artwork.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure multer for artwork image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/artworks/';
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, '-');
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get("/feed", getArtworkFeed);
router.get("/search", searchArtworks);
router.get("/:id", getArtworkById);
router.get("/user/:userId", getUserArtworks); // Supports both ID and username

// Protected routes
router.post("/", authenticateToken, upload.single('image'), createArtwork);
router.put("/:id", authenticateToken, updateArtwork);
router.delete("/:id", authenticateToken, deleteArtwork);
router.post("/:id/like", authenticateToken, toggleLike);
router.post("/:id/save", authenticateToken, toggleSaveArtwork);
router.get("/saved/me", authenticateToken, getSavedArtworks);
router.get("/posted/me", authenticateToken, getPostedArtworks);

export default router;