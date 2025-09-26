import { convertImageToBase64, convertArtworkToBase64, validateImageFile } from '../utils/imageUtils.js';
import fs from 'fs';
import sharp from 'sharp';

/**
 * Simple fallback function to convert image to base64 without compression
 */
const simpleImageToBase64 = async (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    
    // For PNG files (like canvas exports), we need to check if they have transparency
    // and convert them to JPEG with white background to avoid black background
    const extension = filePath.toLowerCase().split('.').pop();
    
    if (extension === 'png') {
      // Convert PNG to JPEG with white background using Sharp if available
      try {
        const processedBuffer = await sharp(imageBuffer)
          .flatten({ background: { r: 255, g: 255, b: 255 } })
          .jpeg({ quality: 90 })
          .toBuffer();
        
        return `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
      } catch (sharpError) {
        // If Sharp fails, fall back to original PNG
        console.warn('Sharp fallback failed, using original PNG:', sharpError.message);
      }
    }
    
    const base64String = imageBuffer.toString('base64');
    
    // Determine MIME type based on file extension
    let mimeType = 'image/jpeg'; // default
    
    if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'gif') mimeType = 'image/gif';
    else if (extension === 'webp') mimeType = 'image/webp';
    
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    throw new Error('Failed to convert image to base64: ' + error.message);
  }
};

/**
 * Middleware to convert uploaded image to base64 and attach to request
 * @param {Object} options - Processing options
 * @param {number} options.maxWidth - Maximum width for compression
 * @param {number} options.maxHeight - Maximum height for compression
 * @param {number} options.quality - JPEG quality (1-100)
 */
export const processImageToBase64 = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return next(); // Let the controller handle missing file error
      }

      const filePath = req.file.path;
      console.log('Processing image:', filePath);

      // Try to validate and convert with Sharp first
      let base64Data;
      try {
        await validateImageFile(filePath);
        
        // Use specialized artwork converter if flagged
        if (options.useArtworkConverter) {
          base64Data = await convertArtworkToBase64(filePath, options);
        } else {
          base64Data = await convertImageToBase64(filePath, options);
        }
      } catch (sharpError) {
        console.warn('Sharp processing failed, using fallback:', sharpError.message);
        // Use simple fallback conversion
        base64Data = await simpleImageToBase64(filePath);
      }

      // Attach base64 data to request object
      req.base64Image = base64Data;

      // Clean up the temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      console.log('Image processing successful');
      next();
    } catch (error) {
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Image processing error:', error);
      console.error('Error stack:', error.stack);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to process image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware specifically for profile images with optimized settings
 */
export const processProfileImage = processImageToBase64({
  maxWidth: 400,
  maxHeight: 400,
  quality: 85
});

/**
 * Middleware for service images with different settings
 */
export const processServiceImage = processImageToBase64({
  maxWidth: 1200,
  maxHeight: 800,
  quality: 80
});

/**
 * Middleware for tutorial images
 */
export const processTutorialImage = processImageToBase64({
  maxWidth: 1000,
  maxHeight: 600,
  quality: 75
});

/**
 * Middleware for artwork images (larger, higher quality)
 */
export const processArtworkImage = (req, res, next) => {
  return processImageToBase64({
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 85,
    useArtworkConverter: true // Flag to use specialized artwork converter
  })(req, res, next);
};
