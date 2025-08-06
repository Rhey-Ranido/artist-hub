import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ui/ImageUpload';
import { 
  Briefcase, 
  DollarSign, 
  Tag, 
  Clock, 
  RotateCcw,
  Plus,
  X,
  Loader2,
  CheckCircle
} from 'lucide-react';

const ServiceCreationForm = ({ onSuccess, onSkip, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: {
      amount: '',
      unit: 'hour'
    },
    category: '',
    tags: [],
    deliveryTime: '',
    revisions: '1',
    requirements: []
  });

  const [inputValues, setInputValues] = useState({
    tagInput: '',
    requirementInput: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const API_BASE_URL = 'http://localhost:3000/api';

  const categories = [
    'Technology', 'Marketing', 'Design', 'Writing', 'Business', 'Other'
  ];

  const priceUnits = [
    { value: 'hour', label: 'Per Hour' },
    { value: 'project', label: 'Per Project' },
    { value: 'day', label: 'Per Day' },
    { value: 'week', label: 'Per Week' },
    { value: 'month', label: 'Per Month' }
  ];

  const deliveryOptions = [
    '1-2 days',
    '3-5 days',
    '1 week',
    '2 weeks',
    '3-4 weeks',
    '1-2 months'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    setInputValues(prev => ({
      ...prev,
      [`${field}Input`]: value
    }));
  };

  const addToArray = (field) => {
    const inputKey = `${field}Input`;
    const value = inputValues[inputKey].trim();
    
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
      setInputValues(prev => ({
        ...prev,
        [inputKey]: ''
      }));
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addToArray(field);
    }
  };

  // Image upload handlers
  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    setError('');

    try {
      // Store files for later upload after service creation
      const fileArray = Array.isArray(files) ? files : [files];
      setUploadedImages(prev => [...prev, ...fileArray]);
      
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message || 'Failed to process images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageRemove = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Service title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Service description is required');
      return false;
    }
    if (!formData.price.amount || formData.price.amount <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data for submission
      const serviceData = {
        ...formData,
        price: {
          amount: Number(formData.price.amount),
          unit: formData.price.unit
        },
        revisions: Number(formData.revisions)
      };

      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create service');
      }

      // Upload images if any were selected
      if (uploadedImages.length > 0) {
        try {
          const imageFormData = new FormData();
          uploadedImages.forEach(file => {
            imageFormData.append('images', file);
          });

          const imageResponse = await fetch(`${API_BASE_URL}/upload/service/${data.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: imageFormData,
          });

          if (!imageResponse.ok) {
            console.warn('Failed to upload images, but service was created successfully');
          }
        } catch (imageError) {
          console.warn('Error uploading images:', imageError);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data);
        }
      }, 2000);

    } catch (err) {
      setError(err.message || 'An error occurred while creating your service');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Created Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your first service has been created and is now live on the platform. 
              Clients can now discover and book your services.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.href = '/services'}>
                View All Services
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                Back to Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Create Your First Service
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Set up your first service offering to start attracting clients
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Close modal"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Professional Web Development, Logo Design, Content Writing"
                required
              />
            </div>

            {/* Service Images */}
            <div className="space-y-2">
              <Label>Service Images</Label>
              <p className="text-sm text-gray-600 mb-4">
                Upload images to showcase your work. You can upload up to 5 images.
              </p>
              <ImageUpload
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                maxFiles={5}
                maxSize={5}
                acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                previewImages={uploadedImages.map(file => ({
                  file,
                  url: URL.createObjectURL(file),
                  name: file.name,
                  size: file.size
                }))}
                loading={uploadingImages}
                multiple={true}
                uploadText="Upload Service Images"
                dragText="Drag and drop your service images here"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief description for service cards (optional)"
                maxLength={150}
              />
              <p className="text-xs text-gray-500">
                {formData.shortDescription.length}/150 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service in detail. What do you offer? What makes you unique? What can clients expect?"
                className="min-h-[120px] w-full px-3 py-2 border border-gray-300 rounded-md resize-vertical"
                rows={5}
                required
              />
            </div>
          </div>

          {/* Pricing and Category */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing & Category
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price.amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceUnit">Price Unit</Label>
                <Select
                  value={formData.price.unit}
                  onValueChange={(value) => handleSelectChange('price.unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceUnits.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Service Terms
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time</Label>
                <Select
                  value={formData.deliveryTime}
                  onValueChange={(value) => handleSelectChange('deliveryTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revisions">Number of Revisions</Label>
                <Input
                  id="revisions"
                  name="revisions"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.revisions}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={inputValues.tagInput}
                  onChange={(e) => handleArrayInputChange('tag', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'tags')}
                  placeholder="Add tags to help clients find your service"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray('tags')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeFromArray('tags', index)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Requirements from Client</h3>
            <p className="text-sm text-gray-600">
              What do you need from clients to start working on their project?
            </p>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={inputValues.requirementInput}
                  onChange={(e) => handleArrayInputChange('requirement', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'requirements')}
                  placeholder="e.g., Project brief, Brand guidelines, Content and images"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray('requirements')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.requirements.length > 0 && (
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('requirements', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button 
              type="submit" 
              disabled={loading}
              className="sm:order-2"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSkip}
              disabled={loading}
              className="sm:order-1"
            >
              Skip for Now
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceCreationForm; 