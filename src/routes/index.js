const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const otpRoutes = require('./otpRoutes');
const parkingLocationRoutes = require('./parkingLocationRoutes');
const parkingSpotRoutes = require('./parkingSpotRoutes');
const bookingRoutes = require('./bookingRoutes');

router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);
router.use('/locations', parkingLocationRoutes);
router.use('/spots', parkingSpotRoutes);
router.use('/bookings', bookingRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
