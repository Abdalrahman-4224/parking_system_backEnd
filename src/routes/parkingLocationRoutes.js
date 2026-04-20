const express = require('express');
const router = express.Router();
const {
  getAllLocations,
  getLocationById,
  createLocation,
  getNearbyLocations
} = require('../controllers/parkingLocationController');
const { authenticate } = require('../middleware/auth');

// Get nearby locations (must be before /:id route to avoid conflicts)
router.get('/nearby', getNearbyLocations);

// Get all locations
router.get('/', getAllLocations);

// Get location by ID
router.get('/:id', getLocationById);

// Create new location (requires authentication)
router.post('/', authenticate, createLocation);

module.exports = router;
