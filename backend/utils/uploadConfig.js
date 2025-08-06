import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload directory based on file purpose
    if (req.uploadType === 'profile') {
      uploadPath += 'profiles/';
    } else if (req.uploadType === 'service') {
      uploadPath += 'services/';
    } else {
      uploadPath += 'misc/';
    }
    
    // Ensure directory exists
    ensureDirectoryExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, '-');
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Upload middleware functions
export const uploadSingle = (uploadType, fieldName = 'image') => {
  return (req, res, next) => {
    req.uploadType = uploadType;
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'File too large. Maximum size is 5MB.' 
            });
          }
        }
        return res.status(400).json({ 
          message: err.message || 'Error uploading file' 
        });
      }
      next();
    });
  };
};

export const uploadMultiple = (uploadType, maxCount = 5) => {
  return (req, res, next) => {
    req.uploadType = uploadType;
    upload.array('images', maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'File too large. Maximum size is 5MB per file.' 
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
              message: `Too many files. Maximum is ${maxCount} files.` 
            });
          }
        }
        return res.status(400).json({ 
          message: err.message || 'Error uploading files' 
        });
      }
      next();
    });
  };
};

// Utility function to delete file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file URL
export const getFileUrl = (req, fileName) => {
  if (!fileName) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
};

export default upload; 