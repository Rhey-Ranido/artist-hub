import express from "express";
import { getPublishedTutorials, getTutorialDetails, getTutorialCategories, getTutorialDifficulties, toggleTutorialReaction, completeTutorial, getAccessibleTutorials } from "../controllers/tutorial.controller.js";
import { protect, optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public tutorial routes - specific routes first
router.get("/", optionalAuth, getPublishedTutorials);
router.get("/accessible", optionalAuth, getAccessibleTutorials);
router.get("/categories", getTutorialCategories);
router.get("/difficulties", getTutorialDifficulties);

// Parameterized routes last
router.get("/:id", optionalAuth, getTutorialDetails);

// Protected tutorial routes (require authentication)
router.post("/:id/reaction", protect, toggleTutorialReaction);
router.post("/:id/complete", protect, completeTutorial);

export default router;
