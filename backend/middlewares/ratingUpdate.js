import Service from '../models/Service.js';
import Provider from '../models/Provider.js';

// Middleware to update service ratings after review operations
export const updateServiceRating = async (req, res, next) => {
  try {
    const originalSend = res.send;
    res.send = function(data) {
      // If the response is successful, update the service rating
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const serviceId = req.body.serviceId || (req.params.serviceId);
        if (serviceId) {
          Service.updateRatingStats(serviceId).catch(console.error);
        }
      }
      return originalSend.call(this, data);
    };
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to update provider ratings after review operations
export const updateProviderRating = async (req, res, next) => {
  try {
    const originalSend = res.send;
    res.send = function(data) {
      // If the response is successful, update the provider rating
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const providerId = req.body.providerId || (req.params.providerId);
        if (providerId) {
          Provider.updateRatingStats(providerId).catch(console.error);
        }
      }
      return originalSend.call(this, data);
    };
    next();
  } catch (error) {
    next(error);
  }
}; 