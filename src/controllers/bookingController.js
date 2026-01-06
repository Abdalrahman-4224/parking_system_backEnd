const { Booking, ParkingSpot, ParkingLocation, User } = require('../models');
const { sequelize } = require('../config/database');

const createBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { spotNumber, locationId, durationHours, paymentMethod, vehicleNumber } = req.body;
    const userId = req.user.id;

    const spot = await ParkingSpot.findOne({
      where: {
        spotNumber,
        locationId,
        isActive: true
      },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!spot) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    if (spot.status !== 'available') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Parking spot is currently ${spot.status}`
      });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    const totalAmount = (spot.hourlyRate * durationHours).toFixed(2);

    const booking = await Booking.create({
      userId,
      spotId: spot.id,
      startTime,
      endTime,
      durationHours,
      totalAmount,
      paymentMethod,
      vehicleNumber,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      bookingStatus: 'active'
    }, { transaction });

    spot.status = 'occupied';
    await spot.save({ transaction });

    await transaction.commit();

    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: ParkingSpot,
          as: 'spot',
          include: [
            {
              model: ParkingLocation,
              as: 'location',
              attributes: ['id', 'name', 'address', 'city']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: bookingWithDetails
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.bookingStatus = status;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: ParkingSpot,
          as: 'spot',
          include: [
            {
              model: ParkingLocation,
              as: 'location',
              attributes: ['id', 'name', 'address', 'city']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id, userId },
      include: [
        {
          model: ParkingSpot,
          as: 'spot',
          include: [
            {
              model: ParkingLocation,
              as: 'location'
            }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const completeBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id, userId },
      include: [{ model: ParkingSpot, as: 'spot' }],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.bookingStatus === 'completed') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Booking is already completed'
      });
    }

    booking.bookingStatus = 'completed';
    booking.paymentStatus = 'completed';
    await booking.save({ transaction });

    const spot = await ParkingSpot.findByPk(booking.spotId, { transaction });
    spot.status = 'available';
    await spot.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id, userId },
      include: [{ model: ParkingSpot, as: 'spot' }],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.bookingStatus === 'completed' || booking.bookingStatus === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.bookingStatus} booking`
      });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save({ transaction });

    const spot = await ParkingSpot.findByPk(booking.spotId, { transaction });
    spot.status = 'available';
    await spot.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  completeBooking,
  cancelBooking
};
