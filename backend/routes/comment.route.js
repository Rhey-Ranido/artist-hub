import express from "express";
import { 
  createComment, 
  getArtworkComments, 
  updateComment, 
  deleteComment,
  toggleCommentLike 
} from "../controllers/comment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/artwork/:artworkId", getArtworkComments);

// Protected routes
router.post("/", authenticateToken, createComment);
router.put("/:id", authenticateToken, updateComment);
router.delete("/:id", authenticateToken, deleteComment);
router.post("/:id/like", authenticateToken, toggleCommentLike);

export default router;