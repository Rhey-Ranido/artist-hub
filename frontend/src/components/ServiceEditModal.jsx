import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceImageManager from './ServiceImageManager';
import { 
  X,
  Save,
  Loader2,
  Briefcase,
  DollarSign,
  Tag,
  Clock,
  Image as ImageIcon
} from 'lucide-react';

const ServiceEditModal = ({ service, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: service.title || '',
    description: service.description || '',
    shortDescription: service.shortDescription || '',
    price: {
      amount: service.price?.amount || '',
      unit: service.price?.unit || 'hour'
    },
    category: service.category || '',
    tags: service.tags || [],
    deliveryTime: service.deliveryTime || '',
    revisions: service.revisions?.toString() || '1',
    requirements: service.requirements || []
  });

  const [inputValues, setInputValues] = useState({
    tagInput: '',
    requirementInput: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const serviceData = {
        ...formData,
        price: {
          amount: Number(formData.price.amount),
          unit: formData.price.unit
        },
        revisions: Number(formData.revisions)
      };

      const response = await fetch(`${API_BASE_URL}/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update service');
      }

      setSuccess('Service updated successfully!');
      
      if (onUpdate) {
        onUpdate(data);
      }

      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message || 'An error occurred while updating your service');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdate = (updatedService) => {
    if (onUpdate) {
      onUpdate({ service: updatedService });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Edit Service
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Service Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Service Terms */}
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
                        Add
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
                        Add
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
                <div className="flex gap-3 pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="images">
              <ServiceImageManager 
                service={service} 
                onUpdate={handleServiceUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ServiceEditModal; 