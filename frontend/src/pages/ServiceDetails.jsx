/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceReviews from '../components/ServiceReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Calendar,
  Award,
  Shield,
  Heart,
  Share2,
  Download,
  Bookmark,
  Star as StarIcon,
  MessageCircle,
  User,
  Briefcase,
  Languages,
  Award as AwardIcon,
  Clock as ClockIcon,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Linkedin,
  Twitter,
  Github
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Using centralized API base URL

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/services/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service not found');
        }
        throw new Error('Failed to load service details');
      }
      
      const data = await response.json();
      console.log('Service details fetched:', data);
      setService(data);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, unit) => {
    return `$${price}${unit === 'hour' ? '/hr' : unit === 'project' ? '/project' : `/${unit}`}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageNavigation = (direction) => {
    if (!service?.imageUrls?.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === service.imageUrls.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? service.imageUrls.length - 1 : prev - 1
      );
    }
  };

  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch(`${API_BASE_URL}/chat/test`);
      const data = await response.json();
      console.log('API test response:', data);
      return true;
    } catch (err) {
      console.error('API test failed:', err);
      return false;
    }
  };

  const handleContactProvider = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // If not logged in, redirect to login
        navigate('/login');
        return;
      }

      // Test API connection first
      const apiWorking = await testAPIConnection();
      if (!apiWorking) {
        setError('Cannot connect to server. Please check your connection.');
        return;
      }

      console.log('Contacting provider with service data:', {
        serviceId: service.id,
        providerId: service.provider.id,
        providerUserId: service.provider.id, // This should now be the User ID
        serviceTitle: service.title
      });

      // Validate that we have valid MongoDB ObjectIds
      if (!service.id || typeof service.id !== 'string' || service.id.length !== 24) {
        console.error('Invalid service ID:', service.id);
        setError('Invalid service ID');
        return;
      }

      // Check if we have the provider data
      if (!service.provider) {
        console.error('No provider data found');
        setError('Provider data not found');
        return;
      }

      // Validate the provider user ID (for chat creation)
      if (!service.provider.id || typeof service.provider.id !== 'string' || service.provider.id.length !== 24) {
        console.error('Invalid provider user ID:', service.provider.id);
        console.error('Provider data:', service.provider);
        setError('Invalid provider user ID. Please try refreshing the page.');
        return;
      }

      // Additional check to ensure we have a valid user ID
      if (!service.provider.id || service.provider.id === service.provider.providerId) {
        console.error('Provider user ID is missing or same as provider ID');
        setError('Provider user ID is missing. Please try refreshing the page.');
        return;
      }

      console.log('Provider data structure:', {
        id: service.provider.id,
        providerId: service.provider.providerId,
        name: service.provider.name
      });

      // Prepare request body
      const requestBody = { 
        userId: service.provider.id,
        serviceId: service.id,
        initialMessage: `Hi! I'm interested in your "${service.title}" service. Can you tell me more about it?`
      };

      console.log('Request body:', requestBody);
      console.log('API URL:', `${API_BASE_URL}/chat`);

      // Create a chat with the provider
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const chatData = await response.json();
        console.log('Chat created successfully:', chatData);
        
        // Navigate to messages page with the chat ID and service info
        navigate(`/messages?chat=${chatData._id}&provider=${service.provider.id}&serviceId=${service.id}&serviceTitle=${encodeURIComponent(service.title)}`);
      } else {
        // Handle different error status codes
        const errorText = await response.text();
        console.error('Chat creation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });

        if (response.status === 400) {
          setError('Invalid request data. Please try again.');
        } else if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          navigate('/login');
        } else if (response.status === 404) {
          setError('Provider not found.');
        } else if (response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Failed to create chat: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Network error creating chat:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  const handleViewProviderProfile = () => {
    // Navigate to provider profile page using the provider ID, not user ID
    navigate(`/provider/${service.provider.providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Loading service details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load service</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/services')}>
              Back to Services
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/services')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Images */}
            {service.imageUrls && service.imageUrls.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={service.imageUrls[currentImageIndex]}
                      alt={service.title}
                      className="w-full h-96 object-cover rounded-t-lg cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    
                    {/* Image Navigation */}
                    {service.imageUrls.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2"
                          onClick={() => handleImageNavigation('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                          onClick={() => handleImageNavigation('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {service.imageUrls.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {service.imageUrls.length > 1 && (
                    <div className="p-4 flex space-x-2 overflow-x-auto">
                      {service.imageUrls.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${service.title} ${index + 1}`}
                          className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service Title and Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{service.category}</Badge>
                      {service.featured && (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{service.rating?.average?.toFixed(1) || '0.0'}</span>
                        <span>({service.rating?.count || 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{service.totalOrders || 0} orders</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{service.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Details Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="packages">Packages</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Service Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>Delivery Time: {service.deliveryTime || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                            <span>Revisions: {service.revisions || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>Starting Price: {formatPrice(service.price.amount, service.price.unit)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {service.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Statistics - Moved from sidebar */}
                    <div className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Service Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{service.rating?.average?.toFixed(1) || '0.0'}</div>
                              <div className="text-sm text-gray-600">Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{service.rating?.count || 0}</div>
                              <div className="text-sm text-gray-600">Reviews</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{service.totalOrders || 0}</div>
                              <div className="text-sm text-gray-600">Orders</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{service.views || 0}</div>
                              <div className="text-sm text-gray-600">Views</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Provider Skills - Moved from sidebar */}
                    {service.provider.skills && service.provider.skills.length > 0 && (
                      <div className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Provider Skills</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {service.provider.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    {/* Provider Categories */}
                    {service.provider.categories && service.provider.categories.length > 0 && (
                      <div className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Provider Categories</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {service.provider.categories.map((category, index) => (
                                <Badge key={index} variant="outline">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    {/* Provider Languages */}
                    {service.provider.languages && service.provider.languages.length > 0 && (
                      <div className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Languages</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {service.provider.languages.map((language, index) => (
                                <Badge key={index} variant="outline">
                                  <Languages className="h-3 w-3 mr-1" />
                                  {language}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="packages" className="p-6">
                    {service.packages && service.packages.length > 0 ? (
                      <div className="space-y-4">
                        {service.packages.map((pkg, index) => (
                          <Card key={index} className="border-2">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                <div className="text-2xl font-bold text-primary">
                                  ${pkg.price}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600 mb-4">{pkg.description}</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4" />
                                  <span>Delivery: {pkg.deliveryTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Revisions: {pkg.revisions}</span>
                                </div>
                              </div>
                              {pkg.features && pkg.features.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium mb-2">Includes:</h5>
                                  <ul className="space-y-1">
                                    {pkg.features.map((feature, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No packages available</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="requirements" className="p-6">
                    {service.requirements && service.requirements.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold">What I need from you:</h4>
                        <ul className="space-y-2">
                          {service.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No specific requirements listed</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="faq" className="p-6">
                    {service.faqs && service.faqs.length > 0 ? (
                      <div className="space-y-4">
                        {service.faqs.map((faq, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{faq.question}</h4>
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No FAQ available</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="p-6">
                    <ServiceReviews 
                      serviceId={service.id} 
                      onReviewUpdate={async () => {
                        // Add a small delay to ensure backend has updated the statistics
                        await new Promise(resolve => setTimeout(resolve, 500));
                        await fetchServiceDetails();
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatPrice(service.price.amount, service.price.unit)}
                </div>
                <p className="text-gray-600 mb-4">Starting price</p>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleContactProvider}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Provider
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleViewProviderProfile}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Provider Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card>
              <CardHeader>
                <CardTitle>About the Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    {service.provider.profileImageUrl ? (
                      <img 
                        src={service.provider.profileImageUrl} 
                        alt={service.provider.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{service.provider.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{service.provider.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span>({service.provider.rating?.count || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{service.provider.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span>{service.provider.totalServices || 0} services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AwardIcon className="h-4 w-4 text-gray-500" />
                    <span>{service.provider.completedProjects || 0} projects completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span>Response time: {service.provider.responseTime || 'Not specified'}</span>
                  </div>
                  {service.provider.memberSince && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Member since {formatDate(service.provider.memberSince)}</span>
                    </div>
                  )}
                  {service.provider.isVerified && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Verified Provider</span>
                    </div>
                  )}
                </div>
                
                {service.provider.bio && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">{service.provider.bio}</p>
                  </div>
                )}
                
                {/* Social Links */}
                {service.provider.socialLinks && Object.keys(service.provider.socialLinks).some(key => service.provider.socialLinks[key]) && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-medium mb-2">Social Links</h5>
                    <div className="flex gap-2">
                      {service.provider.socialLinks.website && (
                        <Button variant="outline" size="sm" onClick={() => window.open(service.provider.socialLinks.website, '_blank')}>
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </Button>
                      )}
                      {service.provider.socialLinks.linkedin && (
                        <Button variant="outline" size="sm" onClick={() => window.open(service.provider.socialLinks.linkedin, '_blank')}>
                          <Linkedin className="h-3 w-3 mr-1" />
                          LinkedIn
                        </Button>
                      )}
                      {service.provider.socialLinks.twitter && (
                        <Button variant="outline" size="sm" onClick={() => window.open(service.provider.socialLinks.twitter, '_blank')}>
                          <Twitter className="h-3 w-3 mr-1" />
                          Twitter
                        </Button>
                      )}
                      {service.provider.socialLinks.github && (
                        <Button variant="outline" size="sm" onClick={() => window.open(service.provider.socialLinks.github, '_blank')}>
                          <Github className="h-3 w-3 mr-1" />
                          GitHub
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full" size="sm" onClick={handleViewProviderProfile}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  <Button variant="outline" className="w-full" size="sm" onClick={handleContactProvider}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetails; 