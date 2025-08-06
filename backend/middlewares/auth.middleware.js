import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = (req, res, next) => {
  console.log('Auth middleware - headers:', {
    authorization: req.headers.authorization ? 'present' : 'missing',
    contentType: req.headers['content-type']
  });
  
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.error('No token provided in request');
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { id: decoded.id, role: decoded.role });

    req.user = {
      _id: decoded.id,
      id: decoded.id, // 🔁 backward compatible
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Alias for backward compatibility and cleaner naming
export const authenticateToken = protect;

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};


