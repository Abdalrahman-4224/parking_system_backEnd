const express = require('express');
const router = express.Router();
const {
  getAvailableSpots,
  getSpotByNumber,
  createSpot,
  updateSpotStatus
} = require('../controllers/parkingSpotController');
const { authenticate } = require('../middleware/auth');

router.get('/location/:locationId/available', getAvailableSpots);
router.get('/location/:locationId/spot/:spotNumber', getSpotByNumber);
router.post('/', authenticate, createSpot);
router.patch('/:id/status', authenticate, updateSpotStatus);

module.exports = router;
