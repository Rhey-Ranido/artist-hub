/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProviderReviews from '../components/ProviderReviews';
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
  ExternalLink,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Github,
  Globe as GlobeIcon
} from 'lucide-react';

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const API_BASE_URL = 'http://localhost:3000/api';

  useEffect(() => {
    fetchProviderProfile();
  }, [id]);

  const fetchProviderProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching provider profile for ID:', id);
      const response = await fetch(`${API_BASE_URL}/providers/${id}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Provider not found');
        }
        throw new Error('Failed to load provider profile');
      }
      
      const data = await response.json();
      console.log('Provider profile fetched:', data);
      setProvider(data);
    } catch (err) {
      console.error('Error fetching provider profile:', err);
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
    if (!provider?.services?.[currentImageIndex]?.images?.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === provider.services[currentImageIndex].images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? provider.services[currentImageIndex].images.length - 1 : prev - 1
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

      console.log('Contacting provider:', {
        providerId: provider.id,
        providerName: provider.name
      });

      // Create a chat with the provider (without specific service)
      const requestBody = { 
        userId: provider.id,
        initialMessage: `Hi ${provider.name}! I'm interested in your services. Can you tell me more about what you offer?`
      };

      console.log('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const chatData = await response.json();
        console.log('Chat created successfully:', chatData);
        
        // Navigate to messages page with the chat ID
        navigate(`/messages?chat=${chatData._id}&provider=${provider.id}&providerName=${encodeURIComponent(provider.name)}`);
      } else {
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

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'github':
        return <Github className="h-4 w-4" />;
      default:
        return <GlobeIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Loading provider profile...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load provider profile</h3>
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

  if (!provider) {
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
            {/* Provider Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                      {provider.profileImage ? (
                        <img 
                                                        src={`http://localhost:5000/uploads/${provider.profileImage}`} 
                          alt={provider.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-primary-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                      {provider.isVerified && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant={provider.status === 'approved' ? 'default' : 'secondary'}>
                        {provider.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{provider.rating.average.toFixed(1)}</span>
                        <span>({provider.rating.count} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{provider.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {formatDate(provider.memberSince)}</span>
                      </div>
                    </div>

                    {provider.bio && (
                      <p className="text-gray-700 mb-4">{provider.bio}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button onClick={handleContactProvider}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Provider
                      </Button>
                      <Button variant="outline">
                        <Heart className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{provider.totalServices}</div>
                    <div className="text-sm text-gray-600">Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{provider.completedProjects}</div>
                    <div className="text-sm text-gray-600">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{provider.totalReviews}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{provider.responseTime}</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="services" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="services" className="p-6">
                    {provider.services && provider.services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {provider.services.map((service) => (
                          <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg mb-1">{service.title}</h4>
                                  <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                                </div>
                                {service.featured && (
                                  <Badge variant="default" className="bg-yellow-100 text-yellow-800 ml-2">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-lg font-bold text-primary">
                                  {formatPrice(service.price, service.priceUnit)}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span>{service.rating.average.toFixed(1)}</span>
                                  <span>({service.rating.count})</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">{service.category}</Badge>
                                <div className="text-sm text-gray-600">
                                  {service.totalOrders} orders
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No services available</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="about" className="p-6">
                    <div className="space-y-6">
                      {/* Skills */}
                      {provider.skills && provider.skills.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {provider.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Categories */}
                      {provider.categories && provider.categories.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Categories</h4>
                          <div className="flex flex-wrap gap-2">
                            {provider.categories.map((category, index) => (
                              <Badge key={index} variant="outline">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {provider.languages && provider.languages.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Languages</h4>
                          <div className="flex flex-wrap gap-2">
                            {provider.languages.map((language, index) => (
                              <Badge key={index} variant="outline">
                                <Languages className="h-3 w-3 mr-1" />
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social Links */}
                      {provider.socialLinks && Object.keys(provider.socialLinks).length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Social Links</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(provider.socialLinks).map(([platform, url]) => (
                              <Button
                                key={platform}
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(url, '_blank')}
                                className="flex items-center gap-2"
                              >
                                {getSocialIcon(platform)}
                                {platform}
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="p-6">
                    <ProviderReviews 
                      providerId={provider.id} 
                      onReviewUpdate={fetchProviderProfile}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleContactProvider}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  
                  {provider.user?.email && (
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Provider Details */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{provider.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span>{provider.totalServices} services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AwardIcon className="h-4 w-4 text-gray-500" />
                    <span>{provider.completedProjects} projects completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span>Response time: {provider.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Member since {formatDate(provider.memberSince)}</span>
                  </div>
                  {provider.lastActive && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Last active: {formatDate(provider.lastActive)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {provider.rating.average.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= provider.rating.average
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {provider.rating.count} reviews
                  </div>
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

export default ProviderProfile; 