# Parking System API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Parking Locations](#parking-locations-endpoints)
  - [Parking Spots](#parking-spots-endpoints)
  - [Bookings](#bookings-endpoints)

---

## Overview

RESTful API for managing a parking system with user authentication, parking spot availability tracking, and booking management.

**Version:** 1.0.0
**Base URL:** `http://localhost:3000/api/v1`

---

## Base URL

```
http://localhost:3000/api/v1
```

All endpoints are prefixed with `/api/v1`

---

## Authentication

This API uses JWT (JSON Web Token) for authentication.

### How to Authenticate

1. Register or login to receive a JWT token
2. Include the token in the `Authorization` header for protected routes:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token Expiration

Tokens expire after **7 days** by default.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error details"
    }
  ]
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized (Missing or Invalid Token) |
| 403 | Forbidden (Account Deactivated) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Endpoints

### Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-26T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "john_doe",
  "phoneNumber": "+1234567890",
  "password": "password123"
}
```

**Validation Rules:**
- `username`: 3-50 characters, required
- `phoneNumber`: Valid phone format, required, unique
- `password`: Minimum 6 characters, required

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-12-26T10:30:00.000Z",
      "updatedAt": "2025-12-26T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Phone number already registered"
}
```

---

### 2. Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-12-26T10:30:00.000Z",
      "updatedAt": "2025-12-26T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

Invalid credentials (401):
```json
{
  "success": false,
  "message": "Invalid phone number or password"
}
```

Account deactivated (403):
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

---

### 3. Get User Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-12-26T10:30:00.000Z",
      "updatedAt": "2025-12-26T10:30:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

## Parking Locations Endpoints

### 1. Get All Parking Locations

Retrieve a list of all active parking locations with availability information.

**Endpoint:** `GET /locations`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Downtown Parking Plaza",
      "address": "123 Main Street",
      "city": "New York",
      "latitude": "40.71280000",
      "longitude": "-74.00600000",
      "totalSpots": 50,
      "isActive": true,
      "createdAt": "2025-12-26T10:00:00.000Z",
      "updatedAt": "2025-12-26T10:00:00.000Z",
      "availableSpots": 45,
      "occupiedSpots": 5,
      "spots": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "spotNumber": "A-101",
          "status": "available",
          "hourlyRate": "5.00"
        }
      ]
    }
  ]
}
```

---

### 2. Get Location by ID

Get detailed information about a specific parking location.

**Endpoint:** `GET /locations/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (UUID): Parking location ID

**Example:** `GET /locations/550e8400-e29b-41d4-a716-446655440001`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Downtown Parking Plaza",
    "address": "123 Main Street",
    "city": "New York",
    "latitude": "40.71280000",
    "longitude": "-74.00600000",
    "totalSpots": 50,
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "availableSpots": 45,
    "occupiedSpots": 5,
    "spots": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "spotNumber": "A-101",
        "locationId": "550e8400-e29b-41d4-a716-446655440001",
        "status": "available",
        "hourlyRate": "5.00",
        "isActive": true,
        "createdAt": "2025-12-26T10:00:00.000Z",
        "updatedAt": "2025-12-26T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Parking location not found"
}
```

---

### 3. Create Parking Location

Create a new parking location (Admin function).

**Endpoint:** `POST /locations`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "Downtown Parking Plaza",
  "address": "123 Main Street",
  "city": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "totalSpots": 50
}
```

**Field Descriptions:**
- `name`: Location name (required)
- `address`: Full street address (required)
- `city`: City name (required)
- `latitude`: GPS latitude (optional)
- `longitude`: GPS longitude (optional)
- `totalSpots`: Total number of spots (required)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Parking location created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Downtown Parking Plaza",
    "address": "123 Main Street",
    "city": "New York",
    "latitude": "40.71280000",
    "longitude": "-74.00600000",
    "totalSpots": 50,
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

## Parking Spots Endpoints

### 1. Get Available Spots by Location

Get all available parking spots at a specific location.

**Endpoint:** `GET /spots/location/:locationId/available`

**Authentication:** Not required

**URL Parameters:**
- `locationId` (UUID): Parking location ID

**Example:** `GET /spots/location/550e8400-e29b-41d4-a716-446655440001/available`

**Success Response (200):**
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "spotNumber": "A-101",
      "locationId": "550e8400-e29b-41d4-a716-446655440001",
      "status": "available",
      "hourlyRate": "5.00",
      "isActive": true,
      "createdAt": "2025-12-26T10:00:00.000Z",
      "updatedAt": "2025-12-26T10:00:00.000Z"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Parking location not found"
}
```

---

### 2. Get Spot by Number

Get details of a specific parking spot by its number and location.

**Endpoint:** `GET /spots/location/:locationId/spot/:spotNumber`

**Authentication:** Not required

**URL Parameters:**
- `locationId` (UUID): Parking location ID
- `spotNumber` (string): Spot number (e.g., "A-101")

**Example:** `GET /spots/location/550e8400-e29b-41d4-a716-446655440001/spot/A-101`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "spotNumber": "A-101",
    "locationId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "available",
    "hourlyRate": "5.00",
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "location": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Downtown Parking Plaza",
      "address": "123 Main Street"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Parking spot not found"
}
```

---

### 3. Create Parking Spot

Add a new parking spot to a location.

**Endpoint:** `POST /spots`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "spotNumber": "A-101",
  "locationId": "550e8400-e29b-41d4-a716-446655440001",
  "hourlyRate": 5.00
}
```

**Field Descriptions:**
- `spotNumber`: Unique spot identifier within location (required)
- `locationId`: UUID of parent location (required)
- `hourlyRate`: Hourly parking rate (optional, default: 5.00)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Parking spot created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "spotNumber": "A-101",
    "locationId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "available",
    "hourlyRate": "5.00",
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Parking location not found"
}
```

---

### 4. Update Spot Status

Update the status of a parking spot (e.g., mark as maintenance).

**Endpoint:** `PATCH /spots/:id/status`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
- `id` (UUID): Parking spot ID

**Request Body:**
```json
{
  "status": "maintenance"
}
```

**Valid Status Values:**
- `available`
- `occupied`
- `reserved`
- `maintenance`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Spot status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "spotNumber": "A-101",
    "locationId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "maintenance",
    "hourlyRate": "5.00",
    "isActive": true,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T11:00:00.000Z"
  }
}
```

---

## Bookings Endpoints

### 1. Create Booking

Create a new parking booking.

**Endpoint:** `POST /bookings`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "spotNumber": "A-101",
  "locationId": "550e8400-e29b-41d4-a716-446655440001",
  "durationHours": 2,
  "paymentMethod": "card",
  "vehicleNumber": "ABC-1234"
}
```

**Field Descriptions:**
- `spotNumber`: Spot number to book (required)
- `locationId`: Location UUID (required)
- `durationHours`: Duration in hours (0.5 - 24) (required)
- `paymentMethod`: "card" or "cash" (required)
- `vehicleNumber`: Vehicle license plate (optional, max 20 chars)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "bookingStatus": "active",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T12:00:00.000Z",
    "spot": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "spotNumber": "A-101",
      "status": "occupied",
      "hourlyRate": "5.00",
      "location": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Downtown Parking Plaza",
        "address": "123 Main Street",
        "city": "New York"
      }
    }
  }
}
```

**Error Responses:**

Spot not found (404):
```json
{
  "success": false,
  "message": "Parking spot not found"
}
```

Spot not available (400):
```json
{
  "success": false,
  "message": "Parking spot is currently occupied"
}
```

---

### 2. Get User Bookings

Get all bookings for the authenticated user.

**Endpoint:** `GET /bookings`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters (Optional):**
- `status`: Filter by booking status (`active`, `completed`, `cancelled`, `expired`)

**Example:** `GET /bookings?status=active`

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "spotId": "550e8400-e29b-41d4-a716-446655440002",
      "startTime": "2025-12-26T12:00:00.000Z",
      "endTime": "2025-12-26T14:00:00.000Z",
      "durationHours": "2.00",
      "totalAmount": "10.00",
      "paymentMethod": "card",
      "paymentStatus": "pending",
      "bookingStatus": "active",
      "vehicleNumber": "ABC-1234",
      "createdAt": "2025-12-26T12:00:00.000Z",
      "updatedAt": "2025-12-26T12:00:00.000Z",
      "spot": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "spotNumber": "A-101",
        "status": "occupied",
        "hourlyRate": "5.00",
        "location": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Downtown Parking Plaza",
          "address": "123 Main Street",
          "city": "New York"
        }
      }
    }
  ]
}
```

---

### 3. Get Booking by ID

Get details of a specific booking.

**Endpoint:** `GET /bookings/:id`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
- `id` (UUID): Booking ID

**Example:** `GET /bookings/550e8400-e29b-41d4-a716-446655440003`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "bookingStatus": "active",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T12:00:00.000Z",
    "spot": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "spotNumber": "A-101",
      "location": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Downtown Parking Plaza",
        "address": "123 Main Street",
        "city": "New York"
      }
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

### 4. Complete Booking

Mark a booking as completed when the user leaves the parking spot.

**Endpoint:** `PATCH /bookings/:id/complete`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
- `id` (UUID): Booking ID

**Example:** `PATCH /bookings/550e8400-e29b-41d4-a716-446655440003/complete`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking completed successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "completed",
    "bookingStatus": "completed",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T14:00:00.000Z"
  }
}
```

**Error Responses:**

Booking not found (404):
```json
{
  "success": false,
  "message": "Booking not found"
}
```

Already completed (400):
```json
{
  "success": false,
  "message": "Booking is already completed"
}
```

---

### 5. Cancel Booking

Cancel an active booking.

**Endpoint:** `PATCH /bookings/:id/cancel`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
- `id` (UUID): Booking ID

**Example:** `PATCH /bookings/550e8400-e29b-41d4-a716-446655440003/cancel`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "spotId": "550e8400-e29b-41d4-a716-446655440002",
    "startTime": "2025-12-26T12:00:00.000Z",
    "endTime": "2025-12-26T14:00:00.000Z",
    "durationHours": "2.00",
    "totalAmount": "10.00",
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "bookingStatus": "cancelled",
    "vehicleNumber": "ABC-1234",
    "createdAt": "2025-12-26T12:00:00.000Z",
    "updatedAt": "2025-12-26T13:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot cancel a completed booking"
}
```

---

## Data Models

### User

```javascript
{
  id: UUID,
  username: String (3-50 chars),
  phoneNumber: String (unique),
  password: String (hashed),
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Parking Location

```javascript
{
  id: UUID,
  name: String (100 chars),
  address: String (255 chars),
  city: String (100 chars),
  latitude: Decimal(10,8),
  longitude: Decimal(11,8),
  totalSpots: Integer,
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Parking Spot

```javascript
{
  id: UUID,
  spotNumber: String (20 chars),
  locationId: UUID (Foreign Key),
  status: Enum ['available', 'occupied', 'reserved', 'maintenance'],
  hourlyRate: Decimal(10,2),
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Booking

```javascript
{
  id: UUID,
  userId: UUID (Foreign Key),
  spotId: UUID (Foreign Key),
  startTime: DateTime,
  endTime: DateTime,
  durationHours: Decimal(5,2),
  totalAmount: Decimal(10,2),
  paymentMethod: Enum ['card', 'cash'],
  paymentStatus: Enum ['pending', 'completed', 'failed', 'refunded'],
  bookingStatus: Enum ['active', 'completed', 'cancelled', 'expired'],
  vehicleNumber: String (20 chars, optional),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## Common Use Cases

### Use Case 1: User Registration and Booking Flow

1. **Register User**
   ```
   POST /auth/register
   ```

2. **Browse Locations**
   ```
   GET /locations
   ```

3. **View Available Spots**
   ```
   GET /spots/location/{locationId}/available
   ```

4. **Check Specific Spot**
   ```
   GET /spots/location/{locationId}/spot/A-101
   ```

5. **Create Booking**
   ```
   POST /bookings
   Authorization: Bearer {token}
   ```

6. **View My Bookings**
   ```
   GET /bookings
   Authorization: Bearer {token}
   ```

7. **Complete Booking**
   ```
   PATCH /bookings/{id}/complete
   Authorization: Bearer {token}
   ```

---

### Use Case 2: Admin Setup Flow

1. **Create Location**
   ```
   POST /locations
   Authorization: Bearer {admin_token}
   ```

2. **Add Multiple Spots**
   ```
   POST /spots (repeat for each spot)
   Authorization: Bearer {admin_token}
   ```

3. **Update Spot Status for Maintenance**
   ```
   PATCH /spots/{id}/status
   Authorization: Bearer {admin_token}
   ```

---

## Rate Limiting

Currently, no rate limiting is implemented. This should be added in production.

**Recommended:** 100 requests per 15 minutes per IP address.

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in decimal format with 2 decimal places
- UUIDs are version 4 (random)
- Passwords are hashed using bcrypt with 10 salt rounds
- The API uses database transactions for booking operations to prevent race conditions

---

## Support

For issues or questions, please contact the development team or open an issue in the project repository.

**API Version:** 1.0.0
**Last Updated:** 2025-12-26
