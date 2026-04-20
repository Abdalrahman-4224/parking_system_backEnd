const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  completeBooking,
  cancelBooking,
  extendBooking
} = require('../controllers/bookingController');
const { createBookingValidator, extendBookingValidator, validate } = require('../validators/bookingValidator');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createBookingValidator, validate, createBooking);
router.get('/', authenticate, getUserBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/complete', authenticate, completeBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);
router.patch('/:id/extend', authenticate, extendBookingValidator, validate, extendBooking);

module.exports = router;
