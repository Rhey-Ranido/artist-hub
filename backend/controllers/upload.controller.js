import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Service from "../models/Service.js";
import { deleteFile, getFileUrl } from "../utils/uploadConfig.js";
import path from 'path';
import fs from 'fs';

// Upload tutorial step image
export const uploadTutorialStepImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = `tutorials/${req.file.filename}`;

    res.status(200).json({
      message: 'Tutorial step image uploaded successfully',
      imageUrl: `/uploads/${fileName}`,
      fullUrl: getFileUrl(req, fileName)
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Error uploading tutorial step image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload user profile image
export const uploadUserProfileImage = async (req, res) => {
  try {
    if (!req.base64Image) {
      return res.status(400).json({ message: 'No image data processed' });
    }

    const userId = req.user.id;

    // Update user with new profile image base64 data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profileImageData: req.base64Image,
        profileImage: null // Clear old file path if exists
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      user: {
        ...updatedUser.toObject(),
        profileImageUrl: req.base64Image // Return base64 data directly
      }
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Simple upload user profile image without processing (fallback)
export const uploadUserProfileImageSimple = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const filePath = req.file.path;

    // Convert to base64 without compression
    const imageBuffer = fs.readFileSync(filePath);
    const base64String = imageBuffer.toString('base64');
    
    // Determine MIME type
    const extension = req.file.originalname.toLowerCase().split('.').pop();
    let mimeType = 'image/jpeg';
    if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'gif') mimeType = 'image/gif';
    else if (extension === 'webp') mimeType = 'image/webp';
    
    const base64Data = `data:${mimeType};base64,${base64String}`;

    // Update user with new profile image base64 data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profileImageData: base64Data,
        profileImage: null
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up the temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      user: {
        ...updatedUser.toObject(),
        profileImageUrl: base64Data
      }
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading profile image (simple):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload provider profile image
export const uploadProviderProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const fileName = `profiles/${req.file.filename}`;

    // Find provider by userId
    const provider = await Provider.findOne({ userId });
    if (!provider) {
      deleteFile(req.file.path);
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const oldImage = provider.profileImage;

    // Update provider with new profile image
    const updatedProvider = await Provider.findByIdAndUpdate(
      provider._id,
      { profileImage: fileName },
      { new: true }
    ).populate('userId', 'email firstName lastName');

    // Delete old image if it exists
    if (oldImage) {
      deleteFile(path.join('uploads', oldImage));
    }

    res.status(200).json({
      message: 'Provider profile image uploaded successfully',
      provider: {
        ...updatedProvider.toObject(),
        profileImageUrl: getFileUrl(req, fileName)
      }
    });

  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Error uploading provider profile image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload service images
export const uploadServiceImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { serviceId } = req.params;
    const userId = req.user.id;

    // Find service and verify ownership
    const service = await Service.findById(serviceId).populate('providerId');
    if (!service) {
      // Delete uploaded files
      req.files.forEach(file => deleteFile(file.path));
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId.userId.toString() !== userId) {
      // Delete uploaded files
      req.files.forEach(file => deleteFile(file.path));
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    // Process uploaded files
    const newImages = req.files.map(file => `services/${file.filename}`);
    
    // Get current images
    const currentImages = service.images || [];
    
    // Combine with existing images
    const allImages = [...currentImages, ...newImages];

    // Update service with new images
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { images: allImages },
      { new: true }
    ).populate('providerId', 'name location');

    // Generate URLs for response
    const imageUrls = allImages.map(img => getFileUrl(req, img));

    res.status(200).json({
      message: 'Service images uploaded successfully',
      service: {
        ...updatedService.toObject(),
        imageUrls
      }
    });

  } catch (error) {
    // Delete uploaded files on error
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    console.error('Error uploading service images:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete service image
export const deleteServiceImage = async (req, res) => {
  try {
    const { serviceId, imageIndex } = req.params;
    const userId = req.user.id;

    // Find service and verify ownership
    const service = await Service.findById(serviceId).populate('providerId');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const images = service.images || [];
    const index = parseInt(imageIndex);

    if (index < 0 || index >= images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    const imageToDelete = images[index];
    
    // Remove image from array
    const updatedImages = images.filter((_, i) => i !== index);

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { images: updatedImages },
      { new: true }
    ).populate('providerId', 'name location');

    // Delete file from filesystem
    deleteFile(path.join('uploads', imageToDelete));

    // Generate URLs for response
    const imageUrls = updatedImages.map(img => getFileUrl(req, img));

    res.status(200).json({
      message: 'Service image deleted successfully',
      service: {
        ...updatedService.toObject(),
        imageUrls
      }
    });

  } catch (error) {
    console.error('Error deleting service image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get image URLs for a user/provider/service
export const getImageUrls = (req, res) => {
  try {
    const { type, id } = req.params;
    
    // This is a utility endpoint to get proper URLs for existing images
    // Mainly used for converting relative paths to full URLs
    
    res.status(200).json({
      message: 'Use specific endpoints for image management'
    });
  } catch (error) {
    console.error('Error getting image URLs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload chat image
export const uploadChatImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = `chat/${req.file.filename}`;
    const fullUrl = `http://localhost:5000/uploads/${fileName}`;

    res.status(200).json({
      message: 'Chat image uploaded successfully',
      imageUrl: fullUrl,
      fullUrl: fullUrl
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Error uploading chat image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 