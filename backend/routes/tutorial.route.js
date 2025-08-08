import express from "express";
import { getPublishedTutorials, getTutorialDetails, getTutorialCategories, getTutorialDifficulties, toggleTutorialReaction } from "../controllers/tutorial.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public tutorial routes - specific routes first
router.get("/", getPublishedTutorials);
router.get("/categories", getTutorialCategories);
router.get("/difficulties", getTutorialDifficulties);

// Parameterized routes last
router.get("/:id", getTutorialDetails);

// Protected tutorial routes (require authentication)
router.post("/:id/reaction", protect, toggleTutorialReaction);

export default router;
