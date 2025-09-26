import sharp from 'sharp';
import fs from 'fs';

/**
 * Convert image file to base64 with compression
 * @param {string} filePath - Path to the image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 800)
 * @param {number} options.maxHeight - Maximum height (default: 800)
 * @param {number} options.quality - JPEG quality 1-100 (default: 80)
 * @returns {Promise<string>} Base64 encoded image string
 */
export const convertImageToBase64 = async (filePath, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 80
  } = options;

  try {
    // Read and process the image
    const processedImageBuffer = await sharp(filePath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Ensure white background
      .jpeg({ quality })
      .toBuffer();

    // Convert to base64
    const base64String = `data:image/jpeg;base64,${processedImageBuffer.toString('base64')}`;
    
    return base64String;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Convert base64 string to image buffer
 * @param {string} base64String - Base64 encoded image string
 * @returns {Buffer} Image buffer
 */
export const base64ToBuffer = (base64String) => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('Error converting base64 to buffer:', error);
    throw new Error('Invalid base64 image data');
  }
};

/**
 * Validate image file size and type
 * @param {string} filePath - Path to the image file
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeBytes - Maximum file size in bytes (default: 5MB)
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {Promise<boolean>} True if valid
 */
export const validateImageFile = async (filePath, options = {}) => {
  const {
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  try {
    const stats = fs.statSync(filePath);
    
    // Check file size
    if (stats.size > maxSizeBytes) {
      throw new Error('File size exceeds maximum allowed size');
    }

    // Check if file is a valid image using sharp
    const metadata = await sharp(filePath).metadata();
    const mimeType = `image/${metadata.format}`;
    
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid image format');
    }

    return true;
  } catch (error) {
    console.error('Image validation error:', error);
    throw error;
  }
};

/**
 * Get image dimensions from base64 string
 * @param {string} base64String - Base64 encoded image string
 * @returns {Promise<Object>} Object containing width and height
 */
export const getBase64ImageDimensions = async (base64String) => {
  try {
    const buffer = base64ToBuffer(base64String);
    const metadata = await sharp(buffer).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw new Error('Failed to get image dimensions');
  }
};

/**
 * Compress base64 image
 * @param {string} base64String - Base64 encoded image string
 * @param {Object} options - Compression options
 * @returns {Promise<string>} Compressed base64 image string
 */
export const compressBase64Image = async (base64String, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 80
  } = options;

  try {
    const buffer = base64ToBuffer(base64String);
    
    const compressedBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Ensure white background
      .jpeg({ quality })
      .toBuffer();

    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error compressing base64 image:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Convert artwork image to base64 with special handling for canvas transparency
 * @param {string} filePath - Path to the image file
 * @param {Object} options - Compression options
 * @returns {Promise<string>} Base64 encoded image string
 */
export const convertArtworkToBase64 = async (filePath, options = {}) => {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 85
  } = options;

  try {
    // First, check if the image has transparency
    const metadata = await sharp(filePath).metadata();
    
    let processedImageBuffer;
    
    if (metadata.hasAlpha || metadata.channels === 4) {
      // Image has transparency - flatten with white background
      processedImageBuffer = await sharp(filePath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background for transparent areas
        .jpeg({ quality })
        .toBuffer();
    } else {
      // Image doesn't have transparency - process normally
      processedImageBuffer = await sharp(filePath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toBuffer();
    }

    // Convert to base64
    const base64String = `data:image/jpeg;base64,${processedImageBuffer.toString('base64')}`;
    
    return base64String;
  } catch (error) {
    console.error('Error converting artwork to base64:', error);
    throw new Error('Failed to process artwork image');
  }
};
