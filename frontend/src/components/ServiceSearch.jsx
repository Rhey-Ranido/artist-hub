import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  MapPin, 
  Filter, 
  Map, 
  Grid3X3, 
  X,
  Loader2,
  Star,
  DollarSign,
  Clock,
  Users,
  AlertCircle,
  Shield,
  Info,
  CheckCircle,
  Navigation,
  User,
  ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color = '#3b82f6', isUser = false) => {
  const iconColor = isUser ? '#ef4444' : color;
  const iconSymbol = isUser ? '📍' : '🏢';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${iconColor};
        width: ${isUser ? '40px' : '30px'};
        height: ${isUser ? '40px' : '30px'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: ${isUser ? '16px' : '12px'};
        ">${iconSymbol}</div>
        ${isUser ? `
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            width: 12px;
            height: 12px;
            background-color: #10b981;
            border-radius: 50%;
            border: 2px solid white;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: isUser ? [40, 40] : [30, 30],
    iconAnchor: isUser ? [20, 40] : [15, 30],
    popupAnchor: [0, -30]
  });
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Map controller component
const MapController = ({ center, zoom, services, userLocation, searchRadius }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      // Calculate zoom level based on search radius
      // Zoom level 13 shows roughly 5km radius
      // Zoom level 14 shows roughly 2.5km radius
      // Zoom level 15 shows roughly 1.2km radius
      let calculatedZoom = zoom;
      if (searchRadius <= 1) calculatedZoom = 15;
      else if (searchRadius <= 2.5) calculatedZoom = 14;
      else if (searchRadius <= 5) calculatedZoom = 13;
      else if (searchRadius <= 10) calculatedZoom = 12;
      else calculatedZoom = 11;
      
      map.setView(center, calculatedZoom);
    }
  }, [center, zoom, map, searchRadius]);

  useEffect(() => {
    const markers = [];
    
    // Add user location marker
    if (userLocation) {
      markers.push([userLocation.lat, userLocation.lng]);
    }
    
    // Add service markers
    services
      .filter(service => service.provider?.location && service.provider?.coordinates)
      .forEach(service => {
        const [lng, lat] = service.provider.coordinates;
        markers.push([lat, lng]);
      });

    if (markers.length > 0) {
      const newBounds = L.latLngBounds(markers);
      map.fitBounds(newBounds, { padding: [20, 20] });
    }
  }, [services, userLocation, map]);

  return null;
};

const ServiceSearch = ({ onSearchResults, onMapToggle, showMap = false, userLocation = null, locationPermission = 'unknown', onLocationGranted, onLocationDenied }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error, denied
  const [searchResults, setSearchResults] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5); // Default 5km radius
  const searchTimeoutRef = useRef(null);

  const API_BASE_URL = 'http://localhost:3000/api';

  // Location permission handling
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          getCurrentLocation();
        } else if (result.state === 'denied') {
          setLocationStatus('denied');
        }
        
        result.addEventListener('change', () => {
          if (result.state === 'granted') {
            getCurrentLocation();
          } else if (result.state === 'denied') {
            setLocationStatus('denied');
          }
        });
      });
    }
  }, []);

  const getCurrentLocation = () => {
    setLocationStatus('loading');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocationStatus('success');
        if (onLocationGranted) {
          onLocationGranted(location);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatus('error');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied');
            if (onLocationDenied) {
              onLocationDenied('permission_denied');
            }
            break;
          case error.POSITION_UNAVAILABLE:
            if (onLocationDenied) {
              onLocationDenied('position_unavailable');
            }
            break;
          case error.TIMEOUT:
            if (onLocationDenied) {
              onLocationDenied('timeout');
            }
            break;
          default:
            if (onLocationDenied) {
              onLocationDenied('unknown');
            }
        }
      },
      options
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': '#3b82f6',
      'Marketing': '#10b981',
      'Design': '#f59e0b',
      'Writing': '#8b5cf6',
      'Business': '#ef4444',
      'Other': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const handleMarkerClick = (service) => {
    setSelectedService(service);
  };

  const handleServiceCardClick = (service) => {
    // Navigate to service details page
    navigate(`/services/${service._id || service.id}`);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Design', label: 'Design' },
    { value: 'Writing', label: 'Writing' },
    { value: 'Business', label: 'Business' },
    { value: 'Other', label: 'Other' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50', label: '$0 - $50' },
    { value: '51-100', label: '$51 - $100' },
    { value: '101-150', label: '$101 - $150' },
    { value: '151-200', label: '$151 - $200' },
    { value: '200+', label: '$200+' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'recent', label: 'Most Recent' }
  ];





  const performSearch = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        search: searchParams.search || searchTerm,
        category: searchParams.category || selectedCategory,
        sortBy: searchParams.sortBy || sortBy,
        limit: '20'
      });

      // Add price range filter
      if (searchParams.priceRange || priceRange !== 'all') {
        const range = searchParams.priceRange || priceRange;
        if (range !== 'all') {
          const [min, max] = range.split('-');
          if (min) params.append('minPrice', min);
          if (max && max !== '+') params.append('maxPrice', max);
        }
      }

      // Add location coordinates if available
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        params.append('radius', searchRadius); // Add search radius
      }

      const response = await fetch(`${API_BASE_URL}/services?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      
      const services = data.services || [];
      setSearchResults(services);
      onSearchResults(services);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search services. Please try again.');
      setSearchResults([]);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm || selectedCategory !== 'all' || priceRange !== 'all') {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedCategory, priceRange, sortBy, searchRadius]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };



  const handleUseMyLocation = () => {
    if (userLocation) {
      performSearch({ sortBy: 'distance' });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('rating');
    setSearchRadius(5);
    setError('');
    onSearchResults([]);
  };



  // Calculate distances for services
  const servicesWithDistance = searchResults.map(service => {
    if (userLocation && service.provider?.coordinates) {
      const [lng, lat] = service.provider.coordinates;
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        lat, lng
      );
      return { ...service, distance };
    }
    return service;
  }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Search Form with Integrated Map */}
      <Card className="mb-4 shadow-sm border-0">
        <CardHeader className="pb-3 px-6">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Services
            </div>
            {locationStatus === 'success' && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3" />
                Location Enabled
              </Badge>
            )}
            {locationStatus === 'denied' && (
              <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                Location Disabled
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Search Form */}
          <div className="px-6 pb-4">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
            {/* Main Search Bar and Quick Actions */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button 
                type="submit" 
                className="h-11 px-8 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-11 px-4 text-sm font-medium border-gray-200 hover:border-gray-300"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide' : 'Filters'}
              </Button>
              
              {userLocation && locationPermission === 'granted' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseMyLocation}
                  className="flex items-center gap-2 h-11 px-4 text-sm font-medium border-gray-200 hover:border-gray-300"
                >
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>
              )}
              
              {locationPermission === 'denied' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-2 h-11 px-4 text-sm font-medium border-gray-200"
                  title="Enable location access to use this feature"
                >
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>
              )}

              <Button
                type="button"
                variant={showMap ? "default" : "outline"}
                size="sm"
                onClick={onMapToggle}
                className="flex items-center gap-2 h-11 px-4 text-sm font-medium"
              >
                <Map className="h-4 w-4" />
                {showMap ? 'List' : 'Map'}
              </Button>

              {(searchTerm || selectedCategory !== 'all' || priceRange !== 'all') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 h-11 px-4 text-sm font-medium border-gray-200 hover:border-gray-300"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="Sort Options" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Search Radius</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="5"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(Number(e.target.value))}
                      min="0.1"
                      max="50"
                      step="0.1"
                      className="h-10 border-gray-200 text-sm"
                    />
                    <span className="text-sm text-gray-600 font-medium">km</span>
                  </div>
                </div>
              </div>
            )}
          </form>

          </div>



          {/* Map Container */}
          {showMap && (
            <div className="px-6 pb-6">
              <div className="h-96 rounded-lg overflow-hidden border border-gray-200" style={{ minHeight: '400px' }}>
                <MapContainer
                  center={userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194]}
                  zoom={userLocation ? 13 : 10} // Zoom level 13 shows roughly 5km radius
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <MapController 
                    center={userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194]} 
                    zoom={10} 
                    services={searchResults}
                    userLocation={userLocation}
                    searchRadius={searchRadius}
                    onServiceClick={handleServiceCardClick}
                  />

                  {/* User Location Marker and Search Radius */}
                  {userLocation && (
                    <>
                      <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={createCustomIcon('#ef4444', true)}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                              <User className="h-4 w-4 text-red-500" />
                              Your Location
                            </h3>
                            <p className="text-xs text-gray-600">
                              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Search radius circle */}
                      <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={searchRadius * 1000} // Convert km to meters
                        pathOptions={{
                          color: '#ef4444',
                          fillColor: '#ef4444',
                          fillOpacity: 0.1,
                          weight: 2
                        }}
                      />
                    </>
                  )}

                  {/* Service Markers */}
                  {servicesWithDistance.map((service, index) => {
                    const [lng, lat] = service.provider.coordinates;
                    const color = getCategoryColor(service.category);
                    
                    return (
                      <Marker
                        key={service.id || index}
                        position={[lat, lng]}
                        icon={createCustomIcon(color)}
                        eventHandlers={{
                          click: () => handleMarkerClick(service)
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[250px]">
                            <h3 className="font-semibold text-sm mb-1">{service.title}</h3>
                            <p className="text-xs text-gray-600 mb-2">{service.provider.name}</p>
                            
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center gap-2 text-xs">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span>{(service.rating?.average || service.provider?.rating || 0).toFixed(1)}</span>
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span>${service.price?.amount || service.price || 0}</span>
                              </div>
                              
                              {service.distance && (
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                  <MapPin className="h-3 w-3" />
                                  <span>{service.distance} km away</span>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleServiceCardClick(service)}
                            >
                              View Details
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          )}

          {/* Selected Service Card */}
          {selectedService && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">Selected Service</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedService(null)}
                  >
                    ×
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{selectedService.title}</h3>
                  <p className="text-sm text-gray-600">{selectedService.provider.name}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{(selectedService.rating?.average || selectedService.provider?.rating || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>${selectedService.price?.amount || selectedService.price || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedService.provider.location}</span>
                  </div>
                  {selectedService.distance && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedService.distance} km
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleServiceCardClick(selectedService)}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const [lng, lat] = selectedService.provider.coordinates;
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                    }}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceSearch; 