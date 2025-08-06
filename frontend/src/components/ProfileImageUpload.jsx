import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Loader2, Camera, Trash2 } from 'lucide-react';

const ProfileImageUpload = ({ 
  type = 'user', // 'user' or 'provider'
  currentImageUrl = null,
  onImageUpdate,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState('');
  
  // You'll need to implement auth store or get token from context/props
  const getAuthToken = () => {
    // Replace with your auth implementation
    return localStorage.getItem('token');
  };

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = async (file) => {
    setError('');
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      // Use correct field name for upload endpoint
      formData.append('image', file);

      const endpoint = type === 'provider' 
        ? `${API_BASE_URL}/upload/profile/provider`
        : `${API_BASE_URL}/upload/profile/user`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      // Update preview with actual uploaded image URL
      const imageUrl = type === 'provider' 
        ? data.provider?.profileImageUrl
        : data.user?.profileImageUrl;

      if (imageUrl) {
        setPreviewUrl(imageUrl);
        // Notify parent component
        if (onImageUpdate) {
          onImageUpdate(imageUrl);
        }
      } else {
        // Fallback: construct URL from profileImage path
        const profileImage = type === 'provider' 
          ? data.provider?.profileImage
          : data.user?.profileImage;
        
            if (profileImage) {
      const fallbackUrl = `http://localhost:5000/uploads/${profileImage}`;
          setPreviewUrl(fallbackUrl);
          if (onImageUpdate) {
            onImageUpdate(fallbackUrl);
          }
        } else {
          throw new Error('No image URL received from server');
        }
      }

      console.log('Image uploaded successfully:', data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      // Reset preview on error
      setPreviewUrl(currentImageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (uploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // Reset input
    e.target.value = '';
  };

  const triggerFileInput = () => {
    if (!uploading) {
      document.getElementById('profile-image-input').click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {type === 'provider' ? 'Provider' : 'Profile'} Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Image Display */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={previewUrl} 
                  alt="Profile" 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-100">
                  <User className="w-12 h-12 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay */}
              <div 
                className={`
                  absolute inset-0 bg-black bg-opacity-50 rounded-full 
                  flex items-center justify-center cursor-pointer
                  opacity-0 hover:opacity-100 transition-opacity
                  ${uploading ? 'opacity-100 cursor-not-allowed' : ''}
                `}
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Change Picture
                  </>
                )}
              </Button>

              {previewUrl && previewUrl !== currentImageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPreviewUrl(currentImageUrl);
                    setError('');
                  }}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>

            {/* Upload Instructions */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                JPEG, PNG, GIF or WebP (max 5MB)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            id="profile-image-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileImageUpload; 