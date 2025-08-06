import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ImageUpload from '@/components/ui/ImageUpload';
import { 
  Image as ImageIcon, 
  Trash2, 
  Upload, 
  Eye,
  X,
  Loader2
} from 'lucide-react';

const ServiceImageManager = ({ service, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const handleImageUpload = async (files) => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (Array.isArray(files)) {
        files.forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append('images', files);
      }

      const response = await fetch(`${API_BASE_URL}/upload/service/${service.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images');
      }

      const data = await response.json();
      setSuccess('Images uploaded successfully!');
      
      // Update the service data
      if (onUpdate) {
        onUpdate(data.service);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageIndex) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/upload/service/${service.id}/image/${imageIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete image');
      }

      const data = await response.json();
      setSuccess('Image deleted successfully!');
      
      // Update the service data
      if (onUpdate) {
        onUpdate(data.service);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Image delete error:', err);
      setError(err.message || 'Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Service Images
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload and manage images to showcase your work. You can upload up to 5 images.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Current Images */}
        {service.imageUrls && service.imageUrls.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Current Images ({service.imageUrls.length}/5)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {service.imageUrls.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Delete button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageDelete(index)}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                  
                  {/* Image number badge */}
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-2 left-2 text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload new images */}
        {(!service.imageUrls || service.imageUrls.length < 5) && (
          <div className="space-y-3">
            <h4 className="font-medium">
              {service.imageUrls && service.imageUrls.length > 0 
                ? `Add More Images (${service.imageUrls.length}/5)`
                : 'Upload Images'
              }
            </h4>
            <ImageUpload
              onUpload={handleImageUpload}
              maxFiles={5 - (service.imageUrls?.length || 0)}
              maxSize={5}
              acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
              loading={uploading}
              multiple={true}
              uploadText="Upload Images"
              dragText="Drag and drop images here"
            />
          </div>
        )}

        {/* Max images reached */}
        {service.imageUrls && service.imageUrls.length >= 5 && (
          <div className="text-center py-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Maximum images reached (5/5)
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              You can delete existing images to upload new ones.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceImageManager; 