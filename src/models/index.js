const User = require('./User');
const ParkingLocation = require('./ParkingLocation');
const ParkingSpot = require('./ParkingSpot');
const Booking = require('./Booking');

// Define associations
ParkingLocation.hasMany(ParkingSpot, {
  foreignKey: 'locationId',
  as: 'spots'
});

ParkingSpot.belongsTo(ParkingLocation, {
  foreignKey: 'locationId',
  as: 'location'
});

User.hasMany(Booking, {
  foreignKey: 'userId',
  as: 'bookings'
});

Booking.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

ParkingSpot.hasMany(Booking, {
  foreignKey: 'spotId',
  as: 'bookings'
});

Booking.belongsTo(ParkingSpot, {
  foreignKey: 'spotId',
  as: 'spot'
});

module.exports = {
  User,
  ParkingLocation,
  ParkingSpot,
  Booking
};
