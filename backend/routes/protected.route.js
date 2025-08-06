import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/client", protect, restrictTo("client"), (req, res) => {
  res.json({ message: "Welcome client" });
});

router.get("/provider", protect, restrictTo("provider"), (req, res) => {
  res.json({ message: "Welcome provider" });
});

router.get("/admin", protect, restrictTo("admin"), (req, res) => {
  res.json({ message: "Welcome admin" });
});

export default router;
