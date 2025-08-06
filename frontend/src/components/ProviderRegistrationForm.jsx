import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Tag, 
  Globe, 
  Plus,
  X,
  Loader2
} from 'lucide-react';

const ProviderRegistrationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: {
      address: ''
    },
    categories: [],
    skills: [],
    languages: ['English'],
    socialLinks: {
      website: '',
      linkedin: '',
      twitter: '',
      github: ''
    }
  });

  const [inputValues, setInputValues] = useState({
    categoryInput: '',
    skillInput: '',
    languageInput: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

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
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.location.address.trim()) {
      setError('Location is required');
      return false;
    }
    if (formData.categories.length === 0) {
      setError('At least one category is required');
      return false;
    }
    if (formData.skills.length === 0) {
      setError('At least one skill is required');
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
      const response = await fetch(`${API_BASE_URL}/providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create provider profile');
      }

      // Update user data in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        role: 'provider'
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Trigger user update event
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating your provider profile');
    } finally {
      setLoading(false);
    }
  };

  const predefinedCategories = [
    'Technology', 'Marketing', 'Design', 'Writing', 'Business', 'Other'
  ];

  const commonSkills = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'SEO', 'Content Writing',
    'Social Media Marketing', 'Data Analysis', 'Consulting', 'Photography', 'Translation'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Become a Service Provider
        </CardTitle>
        <p className="text-gray-600">
          Set up your provider profile to start offering services to clients. Your application will be reviewed by our admin team before approval.
        </p>
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Provider Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your professional name or business name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  placeholder="City, State/Country"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                className="min-h-[100px] w-full px-3 py-2 border border-gray-300 rounded-md resize-vertical"
                rows={4}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories *
            </h3>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedCategories.map(category => (
                  <Button
                    key={category}
                    type="button"
                    variant={formData.categories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (formData.categories.includes(category)) {
                        setFormData(prev => ({
                          ...prev,
                          categories: prev.categories.filter(c => c !== category)
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          categories: [...prev.categories, category]
                        }));
                      }
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={inputValues.categoryInput}
                  onChange={(e) => handleArrayInputChange('category', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'categories')}
                  placeholder="Add custom category"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray('categories')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <button
                        type="button"
                        onClick={() => removeFromArray('categories', index)}
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

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skills *</h3>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {commonSkills.map(skill => (
                  <Button
                    key={skill}
                    type="button"
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (formData.skills.includes(skill)) {
                        setFormData(prev => ({
                          ...prev,
                          skills: prev.skills.filter(s => s !== skill)
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, skill]
                        }));
                      }
                    }}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={inputValues.skillInput}
                  onChange={(e) => handleArrayInputChange('skill', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'skills')}
                  placeholder="Add custom skill"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray('skills')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeFromArray('skills', index)}
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

          {/* Languages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Languages</h3>
            
            <div className="flex gap-2 mb-2">
              <Input
                value={inputValues.languageInput}
                onChange={(e) => handleArrayInputChange('language', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'languages')}
                placeholder="Add language"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray('languages')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((language, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {language}
                  {language !== 'English' && (
                    <button
                      type="button"
                      onClick={() => removeFromArray('languages', index)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Social Links (Optional)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="socialLinks.website"
                  value={formData.socialLinks.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/yourusername"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/yourusername"
                />
              </div>
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
              Create Provider Profile
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
              className="sm:order-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProviderRegistrationForm; 