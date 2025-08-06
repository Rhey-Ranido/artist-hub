import express from "express";
import { accessChat, fetchChats, getPotentialUsers } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Test endpoint to verify the route is working
router.get("/test", (req, res) => {
  res.json({ message: "Chat route is working" });
});

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.get("/users", protect, getPotentialUsers);

export default router;
