import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Upload, X, Image, FileImage, Loader2 } from 'lucide-react';

const ImageUpload = ({
  onUpload,
  onRemove,
  maxFiles = 1,
  maxSize = 5, // MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  previewImages = [],
  loading = false,
  disabled = false,
  className = '',
  uploadText = 'Upload Image',
  dragText = 'Drag and drop your image here',
  multiple = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState(previewImages);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Accepted types: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`);
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File too large. Maximum size: ${maxSize}MB`);
    }

    return errors;
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    // Validate each file
    fileArray.forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(`File ${index + 1}: ${fileErrors.join(', ')}`);
      }
    });

    // Check max files limit
    const totalFiles = previews.length + validFiles.length;
    if (totalFiles > maxFiles) {
      errors.push(`Maximum ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'} allowed`);
      return;
    }

    // Generate previews for valid files
    if (validFiles.length > 0) {
      const newPreviews = [];
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = {
            file,
            url: e.target.result,
            name: file.name,
            size: file.size
          };
          newPreviews.push(preview);
          
          if (newPreviews.length === validFiles.length) {
            setPreviews(prev => [...prev, ...newPreviews]);
            if (onUpload) {
              onUpload(multiple ? validFiles : validFiles[0]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Show errors if any
    if (errors.length > 0) {
      console.error('File upload errors:', errors);
      // You can replace this with a toast notification
      alert(errors.join('\n'));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !loading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || loading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removePreview = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    if (onRemove) {
      onRemove(index);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUploadMore = previews.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canUploadMore && (
        <Card 
          className={`
            border-2 border-dashed transition-colors duration-200 cursor-pointer
            ${isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
            ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !loading && fileInputRef.current?.click()}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              {loading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {loading ? 'Uploading...' : uploadText}
                </p>
                <p className="text-sm text-gray-500">
                  {dragText}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="text-xs">
                    Max {maxFiles} {maxFiles === 1 ? 'file' : 'files'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Up to {maxSize}MB each
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {acceptedTypes.map(t => t.split('/')[1]).join(', ')}
                  </Badge>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={disabled || loading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <FileImage className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={multiple && maxFiles > 1}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || loading}
      />

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Remove button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removePreview(index)}
                  disabled={disabled || loading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* File info */}
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{preview.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(preview.size)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload status */}
      {previews.length >= maxFiles && (
        <div className="text-center">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Maximum files reached ({maxFiles}/{maxFiles})
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 