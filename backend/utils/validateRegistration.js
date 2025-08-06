// utils/validateRegistration.js

export const validateRegistration = (email, password, role) => {
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error("Invalid email format");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!["client", "admin", "provider"].includes(role)) {
    throw new Error("Invalid role");
  }
};
