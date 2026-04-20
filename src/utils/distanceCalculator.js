/**
 * Distance Calculator Utility
 * Uses Haversine formula to calculate distance between GPS coordinates
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance and add it to location object
 * @param {Object} location - Location object with latitude and longitude
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @returns {Object} - Location object with added distance property
 */
function addDistanceToLocation(location, userLat, userLon) {
  const distance = calculateDistance(
    userLat,
    userLon,
    parseFloat(location.latitude),
    parseFloat(location.longitude)
  );

  return {
    ...location,
    distance: parseFloat(distance.toFixed(2)) // Round to 2 decimal places
  };
}

/**
 * Filter locations within radius
 * @param {Array} locations - Array of location objects with distance property
 * @param {number} radius - Maximum radius in kilometers
 * @returns {Array} - Filtered locations within radius
 */
function filterByRadius(locations, radius) {
  return locations.filter((location) => location.distance <= radius);
}

/**
 * Sort locations by distance (nearest first)
 * @param {Array} locations - Array of location objects with distance property
 * @returns {Array} - Sorted locations
 */
function sortByDistance(locations) {
  return locations.sort((a, b) => a.distance - b.distance);
}

/**
 * Validate GPS coordinates
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {boolean} - True if valid coordinates
 */
function isValidCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} - Formatted distance string
 */
function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(2)}km`;
}

module.exports = {
  calculateDistance,
  addDistanceToLocation,
  filterByRadius,
  sortByDistance,
  isValidCoordinates,
  formatDistance
};
