const { ParkingLocation, ParkingSpot } = require('../models');
const {
  addDistanceToLocation,
  filterByRadius,
  sortByDistance,
  isValidCoordinates
} = require('../utils/distanceCalculator');

const getAllLocations = async (req, res, next) => {
  try {
    const locations = await ParkingLocation.findAll({
      where: { isActive: true },
      include: [
        {
          model: ParkingSpot,
          as: 'spots',
          attributes: ['id', 'spotNumber', 'status', 'hourlyRate'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    const locationsWithAvailability = locations.map(location => {
      const locationJSON = location.toJSON();

      console.log(`[DEBUG] Processing ${locationJSON.name}`);
      console.log(`[DEBUG] Has geoJson in DB? ${!!locationJSON.geoJson}`);
      if (locationJSON.geoJson) {
        console.log(`[DEBUG] geoJson type: ${typeof locationJSON.geoJson}`);
      } else {
        console.log(`[DEBUG] geoJson is MISSING/NULL in Model JSON`);
      }

      const availableSpots = locationJSON.spots.filter(
        spot => spot.status === 'available'
      ).length;

      const occupiedSpots = locationJSON.totalSpots - availableSpots;
      const occupancyRate = locationJSON.totalSpots > 0
        ? Math.round((occupiedSpots / locationJSON.totalSpots) * 100)
        : 0;

      // Get price range from spots
      const rates = locationJSON.spots.map(spot => parseFloat(spot.hourlyRate));
      const minRate = rates.length > 0 ? Math.min(...rates) : 0;
      const maxRate = rates.length > 0 ? Math.max(...rates) : 0;

      return {
        id: locationJSON.id,
        name: locationJSON.name,
        address: locationJSON.address,
        city: locationJSON.city,
        latitude: locationJSON.latitude,
        longitude: locationJSON.longitude,
        totalSpots: locationJSON.totalSpots,
        geoJson: locationJSON.geoJson,
        availableSpots,
        occupiedSpots,
        occupancyRate,
        hourlyRate: {
          min: minRate,
          max: maxRate,
          currency: 'USD'
        },
        isActive: locationJSON.isActive,
        createdAt: locationJSON.createdAt,
        updatedAt: locationJSON.updatedAt,
        spots: locationJSON.spots // <--- CRITICAL: Include spots list for map coloring
      };
    });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locationsWithAvailability
    });
  } catch (error) {
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await ParkingLocation.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: ParkingSpot,
          as: 'spots',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Parking location not found'
      });
    }

    const availableSpots = location.spots.filter(
      spot => spot.status === 'available'
    ).length;

    res.status(200).json({
      success: true,
      data: {
        ...location.toJSON(),
        availableSpots,
        occupiedSpots: location.totalSpots - availableSpots,
        spots: location.spots // <--- CRITICAL: Include spots list
      }
    });
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, address, city, latitude, longitude, totalSpots } = req.body;

    const location = await ParkingLocation.create({
      name,
      address,
      city,
      latitude,
      longitude,
      totalSpots
    });

    res.status(201).json({
      success: true,
      message: 'Parking location created successfully',
      data: location
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby parking locations based on user's GPS coordinates
 * GET /api/v1/locations/nearby?latitude=40.7128&longitude=-74.0060&radius=10
 */
const getNearbyLocations = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Validate coordinates
    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Validate radius
    const radiusKm = parseFloat(radius);
    if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be a number between 0 and 100 km'
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // Fetch all active locations with their spots
    const locations = await ParkingLocation.findAll({
      where: { isActive: true },
      include: [
        {
          model: ParkingSpot,
          as: 'spots',
          attributes: ['id', 'spotNumber', 'status', 'hourlyRate'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    // Calculate availability and add distance for each location
    let locationsWithData = locations.map(location => {
      const locationJSON = location.toJSON();

      // Calculate available spots
      const availableSpots = locationJSON.spots.filter(
        spot => spot.status === 'available'
      ).length;

      const occupiedSpots = locationJSON.totalSpots - availableSpots;
      const occupancyRate = locationJSON.totalSpots > 0
        ? Math.round((occupiedSpots / locationJSON.totalSpots) * 100)
        : 0;

      // Get price range from spots
      const rates = locationJSON.spots.map(spot => parseFloat(spot.hourlyRate));
      const minRate = rates.length > 0 ? Math.min(...rates) : 0;
      const maxRate = rates.length > 0 ? Math.max(...rates) : 0;

      return {
        id: locationJSON.id,
        name: locationJSON.name,
        address: locationJSON.address,
        city: locationJSON.city,
        latitude: locationJSON.latitude,
        longitude: locationJSON.longitude,
        longitude: locationJSON.longitude,
        totalSpots: locationJSON.totalSpots,
        geoJson: locationJSON.geoJson,
        availableSpots,
        occupiedSpots,
        occupancyRate,
        hourlyRate: {
          min: minRate,
          max: maxRate,
          currency: 'USD'
        },
        isActive: locationJSON.isActive,
        spots: locationJSON.spots // <--- CRITICAL: Include spots list
      };
    });

    // Add distance to each location
    locationsWithData = locationsWithData.map(location =>
      addDistanceToLocation(location, userLat, userLon)
    );

    // Filter by radius
    locationsWithData = filterByRadius(locationsWithData, radiusKm);

    // Sort by distance (nearest first)
    locationsWithData = sortByDistance(locationsWithData);

    res.status(200).json({
      success: true,
      count: locationsWithData.length,
      data: locationsWithData,
      searchCriteria: {
        userLocation: {
          latitude: userLat,
          longitude: userLon
        },
        radius: radiusKm,
        unit: 'km'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  getNearbyLocations
};
