const { body, validationResult } = require('express-validator');

const createBookingValidator = [
  body('spotNumber')
    .trim()
    .notEmpty()
    .withMessage('Spot number is required'),
  body('locationId')
    .trim()
    .notEmpty()
    .withMessage('Location ID is required')
    .isUUID()
    .withMessage('Invalid location ID format'),
  body('durationHours')
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Duration must be between 0.5 and 24 hours'),
  body('paymentMethod')
    .isIn(['card', 'cash', 'mastercard', 'visa', 'zaincash'])
    .withMessage('Invalid payment method'),
  body('vehicleNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Vehicle number must not exceed 20 characters')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  createBookingValidator,
  validate
};
