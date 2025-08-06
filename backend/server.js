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

dotenv.config();
const app = express();

// CORS configuration - allow frontend to access backend
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// middlewares
app.use(requestLogger);

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// MongoDB + HTTP server + Socket.IO
const server = http.createServer(app);
console.log("✅ MONGO_URI:", process.env.MONGO_URI);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start HTTP server
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
      console.log(`📁 Static files served from: ${path.join(process.cwd(), 'uploads')}`);
    });

    // Initialize Socket.IO
    const io = initSocket(server);
    
    // Attach socket.io to request object BEFORE routes
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({ 
        success: true, 
        message: "Art Studio API is running!", 
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
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

export default app;
