const express = require('express');
const Store = require('../models/Store');
const Product = require('../models/Product');
const router = express.Router();

// GET all active stores with real-time data
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true })
      .populate('owner', 'name email')
      .select('name address contact stats');

    // Get real-time product counts for each store
    const storesWithData = await Promise.all(
      stores.map(async (store) => {
        const activeProducts = await Product.countDocuments({ 
          store: store._id, 
          status: 'active',
          stock: { $gt: 0 }
        });
        
        return {
          id: store._id,
          name: store.name,
          address: `${store.address.street}, ${store.address.city}, ${store.address.state}`,
          lat: store.address.coordinates?.lat || 0,
          lng: store.address.coordinates?.lng || 0,
          city: store.address.city,
          phone: store.contact.phone,
          deals: activeProducts
        };
      })
    );

    res.json({
      success: true,
      locations: storesWithData,
      total: storesWithData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store locations'
    });
  }
});

// GET nearest store based on user coordinates
router.post('/nearest', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const stores = await Store.find({ isActive: true });
    
    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Find nearest store with real-time data
    const storesWithDistance = await Promise.all(
      stores.map(async (store) => {
        const activeProducts = await Product.countDocuments({ 
          store: store._id, 
          status: 'active',
          stock: { $gt: 0 }
        });
        
        return {
          id: store._id,
          name: store.name,
          address: `${store.address.street}, ${store.address.city}`,
          distance: calculateDistance(lat, lng, 
            store.address.coordinates?.lat || 0, 
            store.address.coordinates?.lng || 0
          ),
          deals: activeProducts
        };
      })
    );

    const nearest = storesWithDistance.sort((a, b) => a.distance - b.distance)[0];

    res.json({
      success: true,
      nearest: nearest,
      allLocations: storesWithDistance.sort((a, b) => a.distance - b.distance)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to find nearest store'
    });
  }
});

module.exports = router;