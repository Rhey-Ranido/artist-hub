import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import ServiceSearch from '../components/ServiceSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  List, 
  MapPin, 
  Star,
  DollarSign,
  Clock,
  Users,
  X
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('unknown');
  const servicesPerPage = 12;

  // Using centralized API base URL

  // ServiceSearch handlers
  const handleSearchResults = (results) => {
    setFilteredServices(results);
    setCurrentPage(1);
  };

  const handleMapToggle = () => {
    setShowMap(!showMap);
  };

  const handleLocationGranted = (location) => {
    setUserLocation(location);
    setLocationPermission('granted');
  };

  const handleLocationDenied = (reason) => {
    setLocationPermission('denied');
    console.log('Location access denied:', reason);
  };

  // Fetch services from backend
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/services`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched services:', data);
      
      // The backend already provides the correct format, just use it directly
      const transformedServices = data.services?.map(service => ({
        id: service.id, // Use the id field that backend already provides
        title: service.title,
        description: service.description,
        shortDescription: service.shortDescription,
        price: service.price || 0,
        priceUnit: service.priceUnit || 'hour',
        tags: service.tags || [],
        category: service.category,
        featured: service.featured || false,
        createdAt: service.createdAt,
        deliveryTime: service.deliveryTime,
        revisions: service.revisions,
        totalOrders: service.totalOrders || 0,
        // Include image data
        images: service.images || [],
        imageUrls: service.imageUrls || [],
        provider: {
          id: service.provider?.id,
          name: service.provider?.name || 'Unknown Provider',
          rating: service.provider?.rating || 0,
          reviewCount: service.provider?.reviewCount || 0,
          location: service.provider?.location || 'Location not specified'
        },
        rating: {
          average: service.rating?.average || 0,
          count: service.rating?.count || 0
        },
        // Additional fields that might be useful
        views: service.views || 0,
        isActive: service.isActive !== false // Default to true if not specified
      })) || [];

      setServices(transformedServices);
      setFilteredServices(transformedServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchServices();
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  const handleServiceClick = (service) => {
    if (!service.id) {
      console.error('Service ID is undefined!');
      return;
    }
    
    // Navigate to service detail page
    navigate(`/services/${service.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Unable to load services</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchServices}>
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">All Services</h1>
          <p className="text-muted-foreground">
            Discover professional services from verified providers ({services.length} services available)
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <ServiceSearch 
            onSearchResults={handleSearchResults}
            onMapToggle={handleMapToggle}
            showMap={showMap}
            userLocation={userLocation}
            locationPermission={locationPermission}
            onLocationGranted={handleLocationGranted}
            onLocationDenied={handleLocationDenied}
          />
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} of {filteredServices.length} services
          </p>
        </div>

        {/* Services Grid */}
        {currentServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={handleServiceClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh page
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    size="sm"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Services; 