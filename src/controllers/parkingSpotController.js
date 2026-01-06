const { ParkingSpot, ParkingLocation } = require('../models');

const getAvailableSpots = async (req, res, next) => {
  try {
    const { locationId } = req.params;

    const location = await ParkingLocation.findByPk(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Parking location not found'
      });
    }

    const spots = await ParkingSpot.findAll({
      where: {
        locationId,
        status: 'available',
        isActive: true
      },
      order: [['spotNumber', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (error) {
    next(error);
  }
};

const getSpotByNumber = async (req, res, next) => {
  try {
    const { locationId, spotNumber } = req.params;

    const spot = await ParkingSpot.findOne({
      where: {
        locationId,
        spotNumber,
        isActive: true
      },
      include: [
        {
          model: ParkingLocation,
          as: 'location',
          attributes: ['id', 'name', 'address']
        }
      ]
    });

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    res.status(200).json({
      success: true,
      data: spot
    });
  } catch (error) {
    next(error);
  }
};

const createSpot = async (req, res, next) => {
  try {
    const { spotNumber, locationId, hourlyRate } = req.body;

    const location = await ParkingLocation.findByPk(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Parking location not found'
      });
    }

    const spot = await ParkingSpot.create({
      spotNumber,
      locationId,
      hourlyRate: hourlyRate || 5.00
    });

    res.status(201).json({
      success: true,
      message: 'Parking spot created successfully',
      data: spot
    });
  } catch (error) {
    next(error);
  }
};

const updateSpotStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const spot = await ParkingSpot.findByPk(id);

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    spot.status = status;
    await spot.save();

    res.status(200).json({
      success: true,
      message: 'Spot status updated successfully',
      data: spot
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSpots,
  getSpotByNumber,
  createSpot,
  updateSpotStatus
};
