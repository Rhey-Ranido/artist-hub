# Search Feature with Map Integration

## Overview
The home page now includes a comprehensive search feature that allows users to find services based on location, category, price, and other criteria. The search includes both list and map views for better user experience.

## Features

### 🔍 Advanced Search
- **Text Search**: Search services by title, description, or tags
- **Category Filter**: Filter by Technology, Marketing, Design, Writing, Business, or Other
- **Location-based Search**: Search by city/state or use current location
- **Price Range Filter**: Filter by price ranges ($0-$50, $51-$100, etc.)
- **Sorting Options**: Sort by rating, price, distance, or recency

### 🗺️ Map Integration
- **Interactive Map**: View services on an interactive map using Leaflet
- **Location Markers**: Services are displayed as markers on the map
- **Distance Calculation**: Services are sorted by distance when location is provided
- **Map/List Toggle**: Switch between map view and list view

### 📍 Location Features
- **Location Permission**: Proper permission prompts and feedback
- **Current Location**: Use device GPS to find nearby services (requires permission)
- **Geocoding**: Automatic address lookup for coordinates
- **Distance-based Sorting**: Services sorted by proximity to user location
- **Permission Feedback**: Clear messages when location access is denied or unavailable

## Technical Implementation

### Frontend Components
- `ServiceSearch.jsx`: Main search component with filters and controls
- `ServiceMap.jsx`: Integrated map component with built-in location permission handling
- Updated `Home.jsx`: Integrated search and map functionality with unified location handling

### Backend Enhancements
- Enhanced `service.controller.js` with location-based queries
- Added distance calculation using Haversine formula
- Geospatial queries using MongoDB's `$near` operator
- Support for latitude/longitude parameters

### Dependencies Added
- `leaflet`: Map library
- `react-leaflet`: React wrapper for Leaflet

## Usage

### For Users
1. **Enable Location**: Grant location permission when prompted to access map features
2. **Search Services**: Enter keywords in the search bar
3. **Use Filters**: Click "Filters" to access category, location, and price filters
4. **Use Current Location**: Click "Use My Location" to find nearby services (requires permission)
5. **Toggle Map View**: Click "Map View" to see services on a map
6. **View Details**: Click on any service to view full details

### For Developers
1. **Install Dependencies**: `npm install leaflet react-leaflet`
2. **Start Backend**: Ensure the backend is running with location data
3. **Test Search**: Use the search functionality on the home page
4. **Check Coordinates**: Verify providers have location coordinates in the database

## API Endpoints

### GET /api/services
Supports the following query parameters:
- `search`: Text search term
- `category`: Service category filter
- `location`: Location text filter
- `lat`, `lng`: Coordinates for distance-based search
- `radius`: Search radius in kilometers (default: 50)
- `minPrice`, `maxPrice`: Price range filter
- `sortBy`: Sorting field (rating, price, distance, etc.)
- `sortOrder`: asc or desc
- `limit`: Number of results (default: 12)

## Database Requirements

### Provider Model
Providers must have location data with coordinates:
```javascript
location: {
  address: "San Francisco, CA",
  type: "Point",
  coordinates: [-122.4194, 37.7749] // [longitude, latitude]
}
```

### Geospatial Index
The Provider model includes a 2dsphere index for efficient location queries:
```javascript
providerSchema.index({ "location": "2dsphere" });
```

## Sample Data
The seed data includes providers with coordinates in major cities:
- San Francisco, CA: [-122.4194, 37.7749]
- New York, NY: [-74.0060, 40.7128]
- Seattle, WA: [-122.3321, 47.6062]
- Los Angeles, CA: [-118.2437, 34.0522]
- Austin, TX: [-97.7431, 30.2672]
- Chicago, IL: [-87.6298, 41.8781]

## Future Enhancements
- Real-time location updates
- Service clustering on map
- Advanced filtering options
- Saved search preferences
- Location-based recommendations
- Integration with external mapping services 