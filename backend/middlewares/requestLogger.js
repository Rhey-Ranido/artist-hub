const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next(); // Pass control to the next middleware/route handler
};

// [${new Date().toISOString()}]

export default requestLogger;