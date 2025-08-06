import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, User, MapPin, Clock, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const ServiceCard = ({ service, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle missing service data gracefully
  if (!service) {
    return null;
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(service);
    }
  };

  // Format price display
  const formatPrice = (price, unit) => {
    if (!price) return 'Price on request';
    return `$${price}${unit ? `/${unit}` : ''}`;
  };

  // Handle image navigation
  const handleImageNavigation = (direction, e) => {
    e.stopPropagation(); // Prevent card click
    if (!service.imageUrls?.length) return;
    
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

  // Get current image URL or placeholder
  const getCurrentImage = () => {
    if (service.imageUrls && service.imageUrls.length > 0) {
      return service.imageUrls[currentImageIndex];
    }
    return null;
  };

  const currentImage = getCurrentImage();

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-md overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Service Image */}
        <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-primary/30">
              <ImageIcon className="w-16 h-16" />
            </div>
          )}
          
          {/* Image Navigation for multiple images */}
          {service.imageUrls && service.imageUrls.length > 1 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={(e) => handleImageNavigation('prev', e)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={(e) => handleImageNavigation('next', e)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {service.imageUrls.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Featured badge */}
        {service.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
        
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90 text-foreground font-semibold">
            {formatPrice(service.price, service.priceUnit)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {service.title || 'Untitled Service'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {service.shortDescription || service.description || 'No description available'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {service.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-1 bg-muted text-muted-foreground border-border"
              >
                {tag}
              </Badge>
            ))}
            {service.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-muted text-muted-foreground">
                +{service.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Provider Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {service.provider?.name || 'Unknown Provider'}
              </p>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {service.provider?.location || 'Location not specified'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Rating */}
          {(service.provider?.rating > 0 || service.rating?.average > 0) && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-foreground">
                {(service.provider?.rating || service.rating?.average || 0).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({service.provider?.reviewCount || service.rating?.count || 0})
              </span>
            </div>
          )}
        </div>

        {/* Additional info */}
        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
          {service.deliveryTime && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Delivery: {service.deliveryTime}</span>
            </div>
          )}
          {service.totalOrders > 0 && (
            <span>{service.totalOrders} orders completed</span>
          )}
        </div>

        {/* Action Button */}
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            handleCardClick();
          }}
        >
          <Clock className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard; 