// library imports
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import path from "path";

// socket.io import
import { initSocket } from "./socket.js";

// middlewares imports
import requestLogger from "./middlewares/requestLogger.js";

// imported routes
import authRoutes from "./routes/auth.route.js";
import protectedRoutes from "./routes/protected.route.js";
import artworkRoutes from "./routes/artwork.route.js";
import commentRoutes from "./routes/comment.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import uploadRoutes from "./routes/upload.route.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import tutorialRoutes from "./routes/tutorial.route.js";
import notificationRoutes from "./routes/notification.route.js";
import statsRoutes from "./routes/stats.routes.js";

dotenv.config();
const app = express();

// CORS configuration - allow frontend to access backend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5000",
      "http://127.0.0.1:5173",
      // Add your Render frontend URL here after deployment
      process.env.FRONTEND_URL || "https://artist-hub-1.vercel.app/"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
    optionsSuccessStatus: 200
  })
);

app.use(express.json());

// middlewares
app.use(requestLogger);

// Static file serving for uploaded images with CORS headers
app.use("/uploads", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(process.cwd(), "uploads")));

// MongoDB + HTTP server + Socket.IO
const server = http.createServer(app);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start HTTP server
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
      console.log(
        `📁 Static files served from: ${path.join(process.cwd(), "uploads")}`
      );
    });

    // Initialize Socket.IO
    const io = initSocket(server);

    // Attach socket.io to request object BEFORE routes
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // Health check endpoint for Render
    app.get("/api/health", (req, res) => {
      res.status(200).json({ 
        status: "OK", 
        message: "Server is running",
        timestamp: new Date().toISOString()
      });
    });

    // routes
    app.use("/api/auth", authRoutes);
    app.use("/api/protected", protectedRoutes);
    app.use("/api/artworks", artworkRoutes);
    app.use("/api/comments", commentRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/message", messageRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/tutorials", tutorialRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/stats", statsRoutes);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

export default app;
