import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ServiceManagement from '../components/ServiceManagement';
import ServiceCreationForm from '../components/ServiceCreationForm';
import MessageCenter from '../components/MessageCenter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LayoutDashboard,
  User,
  Briefcase,
  MessageSquare,
  Plus,
  Settings,
  TrendingUp,
  Eye,
  Edit3,
  Trash2,
  Star,
  DollarSign,
  Clock,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  // Remove unused user state
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalOrders: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [providerStatus, setProviderStatus] = useState(null);
  const [provider, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateServiceForm, setShowCreateServiceForm] = useState(false);

  const API_BASE_URL = 'http://localhost:3000/api';

  // Check if user is a provider and redirect if not
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    if (userData.role !== 'provider') {
      navigate('/settings'); // Redirect to settings to become a provider
      return;
    }

    fetchProviderData();
  }, [navigate]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch provider profile to check status
      const providerResponse = await fetch(`${API_BASE_URL}/providers/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (providerResponse.ok) {
        const providerData = await providerResponse.json();
        setProviderStatus(providerData.status);
        setProvider(providerData);
      }

      // Fetch provider's services
      const servicesResponse = await fetch(`${API_BASE_URL}/services/provider/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.services || []);
        
        // Calculate stats from services
        const serviceStats = servicesData.services?.reduce((acc, service) => ({
          totalServices: acc.totalServices + 1,
          totalOrders: acc.totalOrders + (service.totalOrders || 0),
          averageRating: acc.averageRating + (service.rating?.average || 0)
        }), {
          totalServices: 0,
          totalOrders: 0,
          totalEarnings: 0,
          averageRating: 0
        }) || { totalServices: 0, totalOrders: 0, totalEarnings: 0, averageRating: 0 };

        serviceStats.averageRating = serviceStats.totalServices > 0 
          ? serviceStats.averageRating / serviceStats.totalServices 
          : 0;

        setStats(serviceStats);
      }

    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Handle service creation success
  const handleServiceCreationSuccess = (serviceData) => {
    console.log('Service created successfully:', serviceData);
    setShowCreateServiceForm(false);
    fetchProviderData(); // Refresh the data to show the new service
    setError('');
  };

  // Handle service creation cancel/skip
  const handleServiceCreationCancel = () => {
    setShowCreateServiceForm(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showCreateServiceForm) {
        setShowCreateServiceForm(false);
      }
    };

    if (showCreateServiceForm) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [showCreateServiceForm]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-30 flex flex-col bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            )}
            <div className="flex items-center space-x-2">
              {/* Collapse button (desktop only) */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              
              {/* Close button (mobile only) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false); // Close mobile sidebar on selection
                  }}
                  className={`
                    w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-colors duration-150
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                    ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}
                  `}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{tab.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Provider</p>
                  <p className="text-xs text-gray-500 truncate">Dashboard</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h1>
              <div className="w-9"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-4 lg:p-8">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </h1>
                  <p className="text-gray-600">
                    {activeTab === 'overview' && 'Manage your services, profile, and client interactions'}
                    {activeTab === 'profile' && 'Update your provider profile and professional information'}
                    {activeTab === 'services' && 'Create and manage your service offerings'}
                    {activeTab === 'messages' && 'Communicate with clients and manage inquiries'}
                  </p>
                </div>
                                 {activeTab === 'services' && (
                   <Button 
                     className="flex items-center gap-2"
                     onClick={() => setShowCreateServiceForm(true)}
                   >
                     <Plus className="h-4 w-4" />
                     Create Service
                   </Button>
                 )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

                        {/* Service Creation Form Modal */}
            {showCreateServiceForm && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div 
                  className="absolute inset-0" 
                  onClick={handleServiceCreationCancel}
                />
                <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                  <ServiceCreationForm
                    onSuccess={handleServiceCreationSuccess}
                    onSkip={handleServiceCreationCancel}
                    onClose={handleServiceCreationCancel}
                  />
                </div>
              </div>
            )}

            {/* Approval Status Alert */}
            {providerStatus && providerStatus !== 'approved' && (
              <Alert className="mb-6">
                <AlertDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {providerStatus === 'pending' && 'Your provider application is currently under review. You will be notified once approved.'}
                  {providerStatus === 'rejected' && 'Your provider application has been rejected. Please contact support for more information.'}
                  {providerStatus === 'suspended' && 'Your provider account has been suspended. Please contact support for more information.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Admin Feedback Alert */}
            {providerStatus && providerStatus === 'approved' && provider?.adminFeedback && (
              <Alert className="mb-6">
                <AlertDescription className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Admin Feedback:</p>
                    <p className="mt-1">{provider.adminFeedback}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Services</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Star className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.averageRating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Profile Views</p>
                        <p className="text-2xl font-bold text-gray-900">-</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="flex items-center justify-center gap-2"
                      onClick={() => setShowCreateServiceForm(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create New Service
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => setActiveTab('profile')}
                    >
                      <Settings className="h-4 w-4" />
                      Update Profile
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => setActiveTab('messages')}
                    >
                      <MessageSquare className="h-4 w-4" />
                      View Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                      <p className="text-gray-500 mb-4">Create your first service to start attracting clients</p>
                      <Button onClick={() => setShowCreateServiceForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Service
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {services.slice(0, 3).map((service) => (
                        <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{service.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">{service.shortDescription}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-gray-600">
                                  ${service.price?.amount}/{service.price?.unit}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span className="text-sm">{(service.rating?.average || 0).toFixed(1)}</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {service.totalOrders} orders
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {services.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setActiveTab('services')}
                        >
                          View All Services ({services.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Provider Profile Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
                  <p className="text-gray-500 mb-4">
                    Update your provider profile, add portfolio items, and manage your professional information
                  </p>
                  <Button onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Go to Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <ServiceManagement 
              services={services} 
              onRefresh={fetchProviderData}
              onCreateService={() => setShowCreateServiceForm(true)}
            />
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <MessageCenter />
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard; 