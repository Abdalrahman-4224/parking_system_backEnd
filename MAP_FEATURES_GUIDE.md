# Map Features Guide - Parking System Backend

## Overview
The backend now supports map functionality with GPS-based location search, distance calculation, and real-time availability data.

---

## 🗺️ New Features Added

### 1. **Nearby Parking Locations Endpoint**
Get parking locations near user's current position, sorted by distance.

### 2. **Distance Calculation**
Uses Haversine formula to calculate accurate distances between GPS coordinates.

### 3. **Enhanced Location Data**
All location endpoints now include:
- Real-time availability counts
- Occupancy rate percentage
- Price range (min/max hourly rates)

---

## 📍 API Endpoints

### Get Nearby Parking Locations

**Endpoint:** `GET /api/v1/locations/nearby`

**Query Parameters:**
- `latitude` (required) - User's latitude (-90 to 90)
- `longitude` (required) - User's longitude (-180 to 180)
- `radius` (optional) - Search radius in kilometers (default: 10, max: 100)

**Example Request:**
```http
GET /api/v1/locations/nearby?latitude=40.7128&longitude=-74.0060&radius=5
```

**Example Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Downtown Parking",
      "address": "123 Main St",
      "city": "New York",
      "latitude": "40.7138",
      "longitude": "-74.0060",
      "totalSpots": 100,
      "availableSpots": 23,
      "occupiedSpots": 77,
      "occupancyRate": 77,
      "hourlyRate": {
        "min": 5.00,
        "max": 8.00,
        "currency": "USD"
      },
      "isActive": true,
      "distance": 0.11
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "City Center Garage",
      "address": "456 Park Ave",
      "city": "New York",
      "latitude": "40.7200",
      "longitude": "-74.0100",
      "totalSpots": 50,
      "availableSpots": 5,
      "occupiedSpots": 45,
      "occupancyRate": 90,
      "hourlyRate": {
        "min": 6.00,
        "max": 10.00,
        "currency": "USD"
      },
      "isActive": true,
      "distance": 0.95
    }
  ],
  "searchCriteria": {
    "userLocation": {
      "latitude": 40.7128,
      "longitude": -74.006
    },
    "radius": 5,
    "unit": "km"
  }
}
```

**Response Fields Explained:**
- `distance`: Distance from user in kilometers (sorted nearest first)
- `availableSpots`: Number of spots with status='available'
- `occupiedSpots`: Number of occupied spots
- `occupancyRate`: Percentage of occupied spots (0-100)
- `hourlyRate.min`: Cheapest spot rate at this location
- `hourlyRate.max`: Most expensive spot rate at this location

**Features:**
- ✅ Results sorted by distance (nearest first)
- ✅ Only returns locations within specified radius
- ✅ Real-time availability calculation
- ✅ Price range from actual spot rates
- ✅ Validates GPS coordinates
- ✅ Filters only active locations and spots

**Error Responses:**

Missing coordinates:
```json
{
  "success": false,
  "message": "Latitude and longitude are required"
}
```

Invalid coordinates:
```json
{
  "success": false,
  "message": "Invalid GPS coordinates. Latitude must be between -90 and 90, longitude between -180 and 180"
}
```

Invalid radius:
```json
{
  "success": false,
  "message": "Radius must be a number between 0 and 100 km"
}
```

---

### Get All Locations (Enhanced)

**Endpoint:** `GET /api/v1/locations`

**Example Request:**
```http
GET /api/v1/locations
```

**Example Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Downtown Parking",
      "address": "123 Main St",
      "city": "New York",
      "latitude": "40.7138",
      "longitude": "-74.0060",
      "totalSpots": 100,
      "availableSpots": 23,
      "occupiedSpots": 77,
      "occupancyRate": 77,
      "hourlyRate": {
        "min": 5.00,
        "max": 8.00,
        "currency": "USD"
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Changes from previous version:**
- ✅ Added `occupancyRate` percentage
- ✅ Added `hourlyRate` object with min/max range
- ✅ Returns cleaner structure without nested spot details

---

## 🧮 Distance Calculation

### Haversine Formula
The backend uses the **Haversine formula** to calculate the great-circle distance between two GPS coordinates on Earth's surface.

**Formula:**
```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c
```

Where:
- R = Earth's radius (6371 km)
- Δlat = difference in latitudes
- Δlon = difference in longitudes

**Accuracy:**
- Very accurate for distances up to ~1000 km
- Perfect for city-scale parking location searches
- Accounts for Earth's curvature

**Performance:**
- Calculations done in-memory (very fast)
- Handles hundreds of locations without lag

---

## 📱 Frontend Integration Examples

### Example 1: Show Nearest Parking on Map Load

```javascript
// When user allows location access
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;

  // Fetch nearby parking within 10km
  const response = await fetch(
    `http://localhost:3000/api/v1/locations/nearby?latitude=${latitude}&longitude=${longitude}&radius=10`
  );

  const data = await response.json();

  // Display locations on map
  data.data.forEach(location => {
    addMarkerToMap({
      lat: parseFloat(location.latitude),
      lng: parseFloat(location.longitude),
      title: location.name,
      availableSpots: location.availableSpots,
      distance: location.distance,
      price: location.hourlyRate.min
    });
  });
});
```

### Example 2: Real-Time Marker Colors Based on Availability

```javascript
function getMarkerColor(occupancyRate) {
  if (occupancyRate < 50) return 'green';   // Plenty of spots
  if (occupancyRate < 80) return 'yellow';  // Getting full
  return 'red';                              // Almost full
}

data.data.forEach(location => {
  const marker = new Marker({
    position: { lat: location.latitude, lng: location.longitude },
    color: getMarkerColor(location.occupancyRate),
    title: `${location.name} - ${location.availableSpots} spots`
  });
});
```

### Example 3: List View with Distance

```javascript
function renderParkingList(locations) {
  return locations.map(location => ({
    name: location.name,
    address: location.address,
    distance: `${location.distance} km away`,
    available: `${location.availableSpots}/${location.totalSpots} spots`,
    price: `$${location.hourlyRate.min} - $${location.hourlyRate.max}/hr`,
    occupancy: location.occupancyRate
  }));
}
```

### Example 4: Filter by Availability

```javascript
// Only show locations with at least 5 available spots
const availableLocations = data.data.filter(
  location => location.availableSpots >= 5
);
```

---

## 🎨 Map UI Recommendations

### Marker Information
Display on marker popup:
```
📍 [Location Name]
📏 [distance] km away
🅿️ [availableSpots] / [totalSpots] spots available
💰 $[min] - $[max] per hour
```

### Color Coding by Availability
- 🟢 Green: 0-50% full (plenty of space)
- 🟡 Yellow: 50-80% full (filling up)
- 🔴 Red: 80-100% full (almost full)

### List Sorting Options
- Nearest first (default)
- Most available spots
- Cheapest first
- Least crowded (lowest occupancy)

---

## 🧪 Testing the Endpoints

### Test 1: Get Nearby Locations (New York City)
```bash
curl "http://localhost:3000/api/v1/locations/nearby?latitude=40.7128&longitude=-74.0060&radius=10"
```

### Test 2: Small Radius Search
```bash
curl "http://localhost:3000/api/v1/locations/nearby?latitude=40.7128&longitude=-74.0060&radius=2"
```

### Test 3: Large Radius Search
```bash
curl "http://localhost:3000/api/v1/locations/nearby?latitude=40.7128&longitude=-74.0060&radius=50"
```

### Test 4: Invalid Coordinates
```bash
curl "http://localhost:3000/api/v1/locations/nearby?latitude=200&longitude=-74.0060&radius=10"
# Expected: 400 error with validation message
```

### Test 5: Missing Parameters
```bash
curl "http://localhost:3000/api/v1/locations/nearby?latitude=40.7128"
# Expected: 400 error - longitude required
```

---

## 🔧 Configuration

### Default Search Radius
Current default: **10 km**

To change, modify in controller:
```javascript
const { latitude, longitude, radius = 10 } = req.query;
//                                      ^^^ Change this value
```

### Maximum Search Radius
Current maximum: **100 km**

To change:
```javascript
if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
//                                                  ^^^ Change this value
```

### Distance Unit
Currently using **kilometers**.

To use miles instead, modify `distanceCalculator.js`:
```javascript
const R = 6371; // km
// Change to:
const R = 3959; // miles
```

---

## 📊 Performance Considerations

### Current Implementation
- Fetches all active locations from database
- Calculates distances in-memory
- Filters and sorts in JavaScript

**Performance:**
- ✅ Fast for < 1000 locations
- ✅ No external dependencies
- ✅ Works with existing database

### Future Optimization (If Needed)
If you have thousands of locations, consider:

**Option 1: Database-Level Filtering**
Use PostgreSQL's built-in distance functions:
```sql
SELECT * FROM parking_locations
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint(-74.0060, 40.7128)::geography,
  10000  -- 10km in meters
);
```

**Option 2: PostGIS Extension**
- Industry standard for geospatial queries
- Extremely fast for large datasets
- Requires PostgreSQL extension

---

## 🚀 Future Enhancements

### Planned Features (Not Yet Implemented)

#### 1. Search by City/Area
```
GET /api/v1/locations/search?city=NewYork&query=downtown
```

#### 2. Operating Hours
Add to location model:
```javascript
{
  openTime: "06:00",
  closeTime: "22:00",
  isOpen: true  // calculated based on current time
}
```

#### 3. Amenities Filter
```
GET /api/v1/locations/nearby?latitude=40.7128&longitude=-74.0060&amenities=covered,ev_charging
```

#### 4. Favorite Locations
Allow users to save favorite parking spots.

#### 5. Price Predictions
Show expected pricing based on time of day.

#### 6. Historical Availability
Show typical availability patterns.

---

## 📝 Implementation Summary

### Files Created
1. `src/utils/distanceCalculator.js` - Distance calculation utilities
2. `MAP_FEATURES_GUIDE.md` - This documentation

### Files Modified
1. `src/controllers/parkingLocationController.js`
   - Added `getNearbyLocations` function
   - Enhanced `getAllLocations` with occupancy rate and price range

2. `src/routes/parkingLocationRoutes.js`
   - Added `/nearby` route

### No Database Changes Required
All features work with existing database schema! ✅

---

## 🎯 Summary for Frontend Team

**What you can now do:**

1. **Show user's location on map** ✅
2. **Display parking locations as markers** ✅
3. **Calculate distance from user** ✅
4. **Show real-time availability** ✅
5. **Display price ranges** ✅
6. **Filter by radius** ✅
7. **Sort by nearest first** ✅
8. **Color code by occupancy** ✅

**Main endpoint for maps:**
```
GET /api/v1/locations/nearby?latitude={lat}&longitude={lng}&radius={km}
```

**Returns:**
- Locations within radius
- Sorted by distance
- With availability and pricing
- Ready to display on map!

---

## 🆘 Troubleshooting

### No locations returned
- Check if locations exist in database
- Verify locations are within search radius
- Ensure locations have `isActive: true`

### Incorrect distances
- Verify latitude/longitude are correct
- Check coordinate format (decimal degrees)
- Ensure latitude is between -90 and 90
- Ensure longitude is between -180 and 180

### Performance issues
- Reduce search radius
- Add database indexes on latitude/longitude
- Consider PostGIS for large datasets

---

**Status:** ✅ Ready for frontend integration!
**Next Steps:** Integrate with your map component (Google Maps, Mapbox, etc.)
