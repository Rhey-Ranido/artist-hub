import express from "express";
import { 
  createArtwork, 
  getArtworkFeed, 
  getArtworkById, 
  getUserArtworks,
  updateArtwork, 
  deleteArtwork, 
  toggleLike,
  searchArtworks 
} from "../controllers/artwork.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for artwork image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/artworks/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
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

export default router;