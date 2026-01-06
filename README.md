# Parking System Backend API

A Node.js backend API for a parking management system with user authentication, parking spot availability tracking, and booking management.

## Features

- User registration and authentication (JWT-based)
- Multiple parking location support
- Real-time parking spot availability tracking
- Direct booking system with spot number selection
- Payment method choice (Card or Cash)
- Booking management (create, view, complete, cancel)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## Project Structure

```
park_backEnd/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── ParkingLocation.js   # Parking location model
│   │   ├── ParkingSpot.js       # Parking spot model
│   │   ├── Booking.js           # Booking model
│   │   └── index.js             # Model associations
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── parkingLocationController.js
│   │   ├── parkingSpotController.js
│   │   └── bookingController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── parkingLocationRoutes.js
│   │   ├── parkingSpotRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── index.js
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Global error handler
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── bookingValidator.js
│   ├── utils/
│   │   └── jwt.js               # JWT utilities
│   └── server.js                # Application entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE parking_system;
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_system
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000
```

6. Start the server:

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will automatically create the database tables on first run.

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "phoneNumber": "+1234567890",
  "password": "password123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### Parking Locations

#### Get All Locations
```http
GET /api/v1/locations
```

#### Get Location by ID
```http
GET /api/v1/locations/:id
```

#### Create Location (Admin)
```http
POST /api/v1/locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Downtown Parking",
  "address": "123 Main St",
  "city": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "totalSpots": 100
}
```

### Parking Spots

#### Get Available Spots
```http
GET /api/v1/spots/location/:locationId/available
```

#### Get Spot by Number
```http
GET /api/v1/spots/location/:locationId/spot/:spotNumber
```

#### Create Spot
```http
POST /api/v1/spots
Authorization: Bearer <token>
Content-Type: application/json

{
  "spotNumber": "A-101",
  "locationId": "uuid-here",
  "hourlyRate": 5.00
}
```

### Bookings

#### Create Booking
```http
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "spotNumber": "A-101",
  "locationId": "uuid-here",
  "durationHours": 2,
  "paymentMethod": "card",
  "vehicleNumber": "ABC-1234"
}
```

#### Get User Bookings
```http
GET /api/v1/bookings
Authorization: Bearer <token>

Query Parameters:
- status: active | completed | cancelled | expired
```

#### Get Booking by ID
```http
GET /api/v1/bookings/:id
Authorization: Bearer <token>
```

#### Complete Booking
```http
PATCH /api/v1/bookings/:id/complete
Authorization: Bearer <token>
```

#### Cancel Booking
```http
PATCH /api/v1/bookings/:id/cancel
Authorization: Bearer <token>
```

### Health Check
```http
GET /api/v1/health
```

## Database Schema

### Users
- id (UUID, PK)
- username (String, Unique)
- phoneNumber (String, Unique)
- password (Hashed String)
- isActive (Boolean)
- createdAt, updatedAt (Timestamps)

### Parking Locations
- id (UUID, PK)
- name (String)
- address (String)
- city (String)
- latitude (Decimal)
- longitude (Decimal)
- totalSpots (Integer)
- isActive (Boolean)
- createdAt, updatedAt (Timestamps)

### Parking Spots
- id (UUID, PK)
- spotNumber (String)
- locationId (UUID, FK)
- status (Enum: available, occupied, reserved, maintenance)
- hourlyRate (Decimal)
- isActive (Boolean)
- createdAt, updatedAt (Timestamps)

### Bookings
- id (UUID, PK)
- userId (UUID, FK)
- spotId (UUID, FK)
- startTime (DateTime)
- endTime (DateTime)
- durationHours (Decimal)
- totalAmount (Decimal)
- paymentMethod (Enum: card, cash)
- paymentStatus (Enum: pending, completed, failed, refunded)
- bookingStatus (Enum: active, completed, cancelled, expired)
- vehicleNumber (String, Optional)
- createdAt, updatedAt (Timestamps)

## User Workflow

1. User registers/logs in to the app
2. User browses available parking locations
3. User goes to a parking spot and notes the spot number
4. User creates a booking by entering:
   - Spot number
   - Duration needed
   - Payment method (card or cash)
5. System validates spot availability and creates booking
6. User parks and pays via selected method
7. User completes or cancels booking when leaving

## Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Real-time notifications
- Admin dashboard
- Parking spot reservations
- Pricing tiers and discounts
- Mobile push notifications
- IoT sensor integration
- Analytics and reporting

## License

ISC
