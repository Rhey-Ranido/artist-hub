import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Users,
  MapPin,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  Briefcase,
  Globe,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react';

const AdminProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [actionType, setActionType] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(savedUser);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadProviderDetails();
  }, [id, navigate]);

  const loadProviderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/admin/providers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load provider details');
      }

      const data = await response.json();
      setProvider(data.provider);
      setServices(data.services);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/admin/providers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason: newStatus === 'rejected' ? rejectionReason : undefined,
          feedback: adminFeedback || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update provider status');
      }

      // Reload provider details
      await loadProviderDetails();
      setShowRejectionModal(false);
      setShowFeedbackModal(false);
      setRejectionReason('');
      setAdminFeedback('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionWithFeedback = async () => {
    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'suspend': 'suspended',
      'reactivate': 'approved'
    };
    
    await handleStatusUpdate(statusMap[actionType]);
  };

  const openActionModal = (type) => {
    setActionType(type);
    if (type === 'reject') {
      setShowRejectionModal(true);
    } else if (['approve', 'suspend', 'reactivate'].includes(type)) {
      setShowFeedbackModal(true);
    } else {
      handleStatusUpdate(type);
    }
  };

  const handleDeleteProvider = async () => {
    if (!window.confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/admin/providers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete provider');
      }

      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      suspended: 'destructive'
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      suspended: AlertTriangle
    };

    const Icon = icons[status];
    const variant = variants[status];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>Provider not found</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{provider.name}</h1>
              <p className="text-muted-foreground">Provider Details & Management</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(provider.status)}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Provider Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground">{provider.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {provider.user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {provider.location.address}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(provider.createdAt)}
                    </p>
                  </div>
                </div>

                {provider.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-foreground mt-1">{provider.bio}</p>
                  </div>
                )}

                {provider.categories && provider.categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Categories</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {provider.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {provider.skills && provider.skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {provider.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {provider.languages && provider.languages.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Languages</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {provider.languages.map((language) => (
                        <Badge key={language} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {provider.socialLinks && Object.values(provider.socialLinks).some(link => link) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Social Links</label>
                    <div className="flex flex-wrap gap-4 mt-1">
                      {provider.socialLinks.website && (
                        <a 
                          href={provider.socialLinks.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      )}
                      {provider.socialLinks.linkedin && (
                        <a 
                          href={provider.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {provider.socialLinks.github && (
                        <a 
                          href={provider.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Services ({services.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No services created yet</p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{service.title}</h4>
                            <p className="text-sm text-muted-foreground">{service.category}</p>
                            <p className="text-sm text-muted-foreground">
                              ${service.price.amount} per {service.price.unit}
                            </p>
                          </div>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {service.description.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{provider.rating.average.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <span>{provider.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Services</span>
                  <span>{provider.totalServices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed Projects</span>
                  <span>{provider.completedProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span>{provider.responseTime}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {provider.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => openActionModal('approve')}
                      disabled={actionLoading}
                      className="w-full flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve Provider
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openActionModal('reject')}
                      disabled={actionLoading}
                      className="w-full flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject Provider
                    </Button>
                  </>
                )}

                {provider.status === 'approved' && (
                  <Button
                    variant="destructive"
                    onClick={() => openActionModal('suspend')}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    Suspend Provider
                  </Button>
                )}

                {provider.status === 'suspended' && (
                  <Button
                    onClick={() => openActionModal('reactivate')}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Reactivate Provider
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={handleDeleteProvider}
                  disabled={actionLoading}
                  className="w-full flex items-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete Provider
                </Button>
              </CardContent>
            </Card>

            {/* Admin Feedback Display */}
            {(provider.adminFeedback || provider.rejectionReason) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Admin Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.rejectionReason && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                      <p className="text-foreground mt-1">{provider.rejectionReason}</p>
                    </div>
                  )}
                  {provider.adminFeedback && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Admin Feedback</label>
                      <p className="text-foreground mt-1">{provider.adminFeedback}</p>
                    </div>
                  )}
                  {provider.statusUpdatedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-foreground mt-1">{formatDate(provider.statusUpdatedAt)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Reject Provider</h3>
              <p className="text-muted-foreground mb-4">
                Please provide a reason for rejecting this provider (optional):
              </p>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={actionLoading}
                  variant="destructive"
                  className="flex-1"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  onClick={() => setShowRejectionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {actionType === 'approve' && 'Approve Provider'}
                {actionType === 'suspend' && 'Suspend Provider'}
                {actionType === 'reactivate' && 'Reactivate Provider'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Would you like to provide feedback to this provider? (optional):
              </p>
              <Textarea
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Provide feedback or instructions for the provider..."
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleActionWithFeedback}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    actionType === 'approve' ? 'Approve' :
                    actionType === 'suspend' ? 'Suspend' : 'Reactivate'
                  )}
                </Button>
                <Button
                  onClick={() => setShowFeedbackModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminProviderDetail; 