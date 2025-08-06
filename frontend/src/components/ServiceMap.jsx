/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Star, 
  DollarSign, 
  Clock, 
  Users,
  ExternalLink,
  Navigation,
  User,
  Map as MapIcon,
  AlertCircle,
  Loader2,
  Shield,
  Info,
  CheckCircle
} from 'lucide-react';

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
const MapController = ({ center, zoom, services, userLocation, onServiceClick }) => {
  const map = useMap();
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

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
      setBounds(newBounds);
      map.fitBounds(newBounds, { padding: [20, 20] });
    }
  }, [services, userLocation, map]);

  return null;
};

const ServiceMap = ({ services, center, onServiceClick, userLocation, className = "h-96", locationPermission = "unknown", onLocationGranted, onLocationDenied }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error, denied
  const [locationData, setLocationData] = useState(null);
  const mapRef = useRef(null);

  const defaultCenter = center || [37.7749, -122.4194]; // San Francisco
  const defaultZoom = 10;

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
        setLocationData(location);
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

  const handleMarkerClick = (service) => {
    setSelectedService(service);
  };

  const handleServiceCardClick = (service) => {
    if (onServiceClick) {
      onServiceClick(service);
    }
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

  const servicesWithCoordinates = services.filter(
    service => service.provider?.location && service.provider?.coordinates
  );

  // Calculate distances for all services
  const servicesWithDistance = servicesWithCoordinates.map(service => {
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

  // Location permission states
  const getLocationStatusMessage = () => {
    switch (locationStatus) {
      case 'loading':
        return 'Getting your location...';
      case 'success':
        return `Location found: ${locationData?.lat.toFixed(4)}, ${locationData?.lng.toFixed(4)}`;
      case 'denied':
        return 'Location access denied. Please enable location permissions in your browser settings.';
      case 'error':
        return 'Unable to get your location. Please check your browser permissions or try again.';
      default:
        return 'Enable location access to find nearby services and get distance-based results.';
    }
  };

  const getLocationStatusIcon = () => {
    switch (locationStatus) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLocationAlertVariant = () => {
    switch (locationStatus) {
      case 'success':
        return 'default';
      case 'denied':
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Combined Map and Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Interactive Map
            </div>
            {locationStatus === 'success' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Location Enabled
              </Badge>
            )}
            {locationStatus === 'denied' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Location Disabled
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Location Status Alert */}
          <div className="p-4 border-b">
            <Alert variant={getLocationAlertVariant()}>
              {getLocationStatusIcon()}
              <AlertDescription>
                {getLocationStatusMessage()}
              </AlertDescription>
            </Alert>
            
            {/* Location Action Buttons */}
            <div className="mt-3 flex gap-2">
              {locationStatus === 'idle' && (
                <Button 
                  size="sm" 
                  onClick={getCurrentLocation}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Enable Location Access
                </Button>
              )}
              
              {locationStatus === 'success' && locationData && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>Accuracy: ±{Math.round(locationData.accuracy)} meters</span>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              )}
              
              {locationStatus === 'denied' && (
                <div className="text-sm text-gray-600">
                  <p>To use location features, please:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Click the location icon in your browser's address bar</li>
                    <li>Select "Allow" for location access</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className={className} style={{ minHeight: '400px' }}>
            <MapContainer
              ref={mapRef}
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapController 
                center={defaultCenter} 
                zoom={defaultZoom} 
                services={services}
                userLocation={userLocation}
                onServiceClick={onServiceClick}
              />

              {/* User Location Marker */}
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
                    radius={50000} // 50km radius
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
        </CardContent>
      </Card>

      {/* Selected Service Card */}
      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Service</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedService(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
          </CardContent>
        </Card>
      )}

      {/* Services Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">
                {userLocation ? 'Nearby Services' : 'All Services'}
              </h3>
              <p className="text-sm text-gray-600">
                {servicesWithDistance.length} services found
                {userLocation && ' within 50km of your location'}
                {!userLocation && ' (enable location to see distance-based results)'}
              </p>
            </div>
            <div className="flex gap-2">
              {Object.entries(
                servicesWithDistance.reduce((acc, service) => {
                  const category = service.category || 'Other';
                  acc[category] = (acc[category] || 0) + 1;
                  return acc;
                }, {})
              ).map(([category, count]) => (
                <Badge key={category} variant="secondary">
                  {category}: {count}
                </Badge>
              ))}
            </div>
          </div>

          {/* Distance Legend */}
          {userLocation && servicesWithDistance.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Distance Legend:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Marketing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Design</span>
                </div>
              </div>
            </div>
          )}

          {/* No services found message */}
          {servicesWithDistance.length === 0 && (
            <div className="border-t pt-4">
              <div className="text-center py-4">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No services found in this area.
                  {userLocation && ' Try expanding your search or adjusting filters.'}
                  {!userLocation && ' Enable location access to find nearby services.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceMap; 