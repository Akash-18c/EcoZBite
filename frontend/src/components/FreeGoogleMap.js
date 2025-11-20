import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, Phone, Clock } from 'lucide-react';

const FreeGoogleMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [nearestLocation, setNearestLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch EcoZBite locations from backend
  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load store locations');
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }


    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got user location:', { latitude, longitude });
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Find nearest location and update locations list
        try {
          const response = await fetch('http://localhost:4000/api/locations/nearest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude })
          });
          const data = await response.json();
          if (data.success) {
            setNearestLocation(data.nearest);
            setLocations(data.allLocations || []);
          }
        } catch (error) {
          console.error('Error finding nearest location:', error);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to retrieve your location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 // Don't use cached location
      }
    );
  };

  useEffect(() => {
    fetchLocations();
    // Delay location request slightly to ensure page is fully loaded
    const timer = setTimeout(() => {
      getCurrentLocation();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Generate Google Maps iframe URL (100% free)
  const getMapUrl = () => {
    if (!userLocation && locations.length === 0) return '';
    
    let query = '';
    
    if (userLocation && nearestLocation) {
      // Show user location with nearest store
      query = `${userLocation.lat},${userLocation.lng}`;
    } else if (userLocation) {
      // Show user location
      query = `${userLocation.lat},${userLocation.lng}`;
    } else if (locations.length > 0) {
      // Show first location as default
      query = locations[0].address;
    }
    
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  if (loading) {
    return (
      <div className="eco-map-container">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Map...</h3>
            <p className="text-gray-600">Finding EcoZBite stores near you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eco-map-container">
      {/* Header */}
      <div className="eco-map-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-6 h-6 text-green-600 mr-2" />
              EcoZBite Locations
            </h3>
            <p className="text-gray-600 mt-1">
              {locations.length} stores across India • Find fresh deals near you
            </p>
          </div>
          <button
            onClick={getCurrentLocation}
            className="eco-location-btn"
            title="Show My Current Location"
          >
            📍 My Location
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="eco-map-frame">
        {getMapUrl() ? (
          <iframe
            src={getMapUrl()}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="EcoZBite Store Locations"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-green-50">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">Map will load once location is available</p>
            </div>
          </div>
        )}
        
        {/* Map Overlay Info */}
        {nearestLocation && (
          <div className="eco-map-overlay">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Navigation className="w-4 h-4 text-green-600 mr-1" />
                Nearest Store
              </h4>
              <p className="text-sm text-gray-700 mt-1">{nearestLocation.name}</p>
              <p className="text-xs text-gray-500">{nearestLocation.distance?.toFixed(1)} km away</p>
            </div>
          </div>
        )}
      </div>

      {/* Store List */}
      <div className="eco-store-list">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">All EcoZBite Stores</h4>
        <div className="grid gap-4">
          {locations.length > 0 ? locations.map((location, index) => (
            <div key={location.id} className="eco-store-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="font-semibold text-gray-900">{location.name}</h5>
                    {index === 0 && nearestLocation && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Nearest
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {location.address}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {location.phone}
                    </span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {location.deals} products
                    </span>
                    {location.distance && (
                      <span className="text-xs text-blue-600">
                        {location.distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No stores found in your area</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="eco-error-message">
          <p className="text-red-600">{error}</p>
          <button onClick={getCurrentLocation} className="text-green-600 hover:text-green-700 ml-2">
            Try Again
          </button>
        </div>
      )}

      <style>{`
        .eco-map-container {
          background: white;
          border-radius: 16px;
          border: 3px solid #4CAF50;
          box-shadow: 0 10px 25px rgba(76, 175, 80, 0.15);
          overflow: hidden;
          margin: 20px 0;
        }

        .eco-map-header {
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%);
          border-bottom: 1px solid #e5e7eb;
        }

        .eco-location-btn {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .eco-location-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
        }

        .eco-map-frame {
          position: relative;
          height: 400px;
          background: #f8fafc;
        }

        .eco-map-overlay {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 10;
        }

        .eco-store-list {
          padding: 20px;
          background: #fafafa;
          max-height: 300px;
          overflow-y: auto;
        }

        .eco-store-card {
          background: white;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-bottom: 12px;
        }

        .eco-store-card:hover {
          border-color: #4CAF50;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
          transform: translateY(-2px);
        }

        .eco-store-card:last-child {
          margin-bottom: 0;
        }

        .eco-error-message {
          padding: 16px 20px;
          background: #fef2f2;
          border-top: 1px solid #fecaca;
          text-align: center;
        }

        @media (max-width: 768px) {
          .eco-map-container {
            border-radius: 12px;
            border-width: 2px;
            margin: 10px 0;
          }
          
          .eco-map-header {
            padding: 16px;
          }
          
          .eco-location-btn {
            padding: 8px 12px;
            font-size: 14px;
          }
          
          .eco-map-frame {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default FreeGoogleMap;