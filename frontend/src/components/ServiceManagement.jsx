/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  Eye,
  Edit3,
  Trash2,
  Star,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle
} from 'lucide-react';
import ServiceEditModal from './ServiceEditModal';

const ServiceManagement = ({ services, onRefresh, onCreateService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [editingService, setEditingService] = useState(null);

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && service.isActive) ||
                           (statusFilter === 'inactive' && !service.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-high':
          return b.price.amount - a.price.amount;
        case 'price-low':
          return a.price.amount - b.price.amount;
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'rating':
          return (b.rating?.average || 0) - (a.rating?.average || 0);
        default:
          return 0;
      }
    });

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onRefresh?.();
        alert('Service deleted successfully');
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        onRefresh?.();
      } else {
        throw new Error('Failed to update service status');
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Failed to update service status');
    }
  };

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No services created yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your business by creating your first service offering. 
              Showcase your skills and attract potential clients.
            </p>
            <div className="space-y-4">
              <Button size="lg" className="px-8">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Service
              </Button>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Set your own prices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Flexible delivery times</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Full control</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple greeting - no duplicate header since it's handled by dashboard */}
      <div className="text-center sm:text-left">
        <p className="text-gray-600">
          You have {services.length} service{services.length !== 1 ? 's' : ''} created. {services.length === 0 ? 'Create your first service to start earning!' : 'Keep growing your business!'}
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredServices.filter(s => s.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredServices.reduce((sum, s) => sum + s.totalOrders, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredServices.length > 0 
                  ? (filteredServices.reduce((sum, s) => sum + (s.rating?.average || 0), 0) / filteredServices.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredServices.reduce((sum, s) => sum + (s.views || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Service Card */}
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group" 
          onClick={() => onCreateService && onCreateService()}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Service</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a new service offering to attract more clients
              </p>
              <div className="text-xs text-gray-500">
                Click to get started
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            {/* Service Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
              {service.imageUrls && service.imageUrls.length > 0 ? (
                <img
                  src={service.imageUrls[0]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-primary/30">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              )}
              
              {/* Image count badge */}
              {service.imageUrls && service.imageUrls.length > 1 && (
                <Badge variant="secondary" className="absolute top-2 right-2 bg-black/50 text-white">
                  +{service.imageUrls.length - 1}
                </Badge>
              )}
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {service.shortDescription || service.description}
                  </p>
                </div>
                <Badge variant={service.isActive ? "default" : "secondary"} className="ml-2">
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-primary">
                  ${service.price?.amount}
                </div>
                <span className="text-sm text-gray-600">
                  per {service.price?.unit}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {service.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{service.totalOrders}</span>
                  </div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{service.views || 0}</span>
                  </div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
              </div>

              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {service.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {service.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{service.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(`/services/${service.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditingService(service)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleServiceStatus(service.id, service.isActive)}
                >
                  {service.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredServices.length === 0 && services.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <ServiceEditModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onUpdate={(updatedService) => {
            setEditingService(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};

export default ServiceManagement; 