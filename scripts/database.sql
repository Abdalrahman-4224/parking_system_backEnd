-- ========================================
-- Parking System Database Setup
-- ========================================
-- Run this SQL file in pgAdmin or psql to create the database and tables
--
-- Usage in psql:
--   psql -U postgres -f scripts/database.sql
--
-- Usage in pgAdmin:
--   1. Open Query Tool
--   2. Paste this script
--   3. Execute (F5)
-- ========================================

-- Create database (run this separately if needed)
-- CREATE DATABASE parking_system;

-- Connect to the database
\c parking_system;

-- ========================================
-- Create ENUM types
-- ========================================

DO $$ BEGIN
    CREATE TYPE spot_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('card', 'cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('active', 'completed', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_purpose AS ENUM ('registration', 'login', 'reset_password');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- Create Tables
-- ========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Parking Locations Table
CREATE TABLE IF NOT EXISTS parking_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    "totalSpots" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Parking Spots Table
CREATE TABLE IF NOT EXISTS parking_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "spotNumber" VARCHAR(20) NOT NULL,
    "locationId" UUID NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    status spot_status NOT NULL DEFAULT 'available',
    "hourlyRate" DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE ("locationId", "spotNumber")
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "spotId" UUID NOT NULL REFERENCES parking_spots(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "durationHours" DECIMAL(5, 2) NOT NULL,
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    "paymentMethod" payment_method NOT NULL,
    "paymentStatus" payment_status NOT NULL DEFAULT 'pending',
    "bookingStatus" booking_status NOT NULL DEFAULT 'active',
    "vehicleNumber" VARCHAR(20),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- OTPs Table
CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "phoneNumber" VARCHAR(20) NOT NULL,
    "otpCode" VARCHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "isUsed" BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    purpose otp_purpose NOT NULL DEFAULT 'registration',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- Create Indexes
-- ========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users("phoneNumber");

-- Parking Spots indexes
CREATE INDEX IF NOT EXISTS idx_spots_location ON parking_spots("locationId");
CREATE INDEX IF NOT EXISTS idx_spots_status ON parking_spots(status);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings("userId");
CREATE INDEX IF NOT EXISTS idx_bookings_spot ON bookings("spotId");
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings("bookingStatus");

-- OTPs indexes
CREATE INDEX IF NOT EXISTS idx_otps_phone_used ON otps("phoneNumber", "isUsed");
CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps("expiresAt");

-- ========================================
-- Insert Sample Data (Optional)
-- ========================================

-- Sample Parking Locations
INSERT INTO parking_locations (name, address, city, latitude, longitude, "totalSpots")
VALUES
    ('Downtown Parking', '123 Main Street', 'New York', 40.7128, -74.0060, 20),
    ('Airport Parking', '456 Airport Road', 'New York', 40.6413, -73.7781, 30),
    ('Mall Parking Garage', '789 Shopping Center', 'New York', 40.7580, -73.9855, 50),
    ('Central Station Parking', '100 Station Plaza', 'New York', 40.7527, -73.9772, 25),
    ('Beach Side Parking', '200 Ocean Drive', 'New York', 40.5731, -73.9712, 15)
ON CONFLICT DO NOTHING;

-- Function to generate sample parking spots
DO $$
DECLARE
    loc RECORD;
    section CHAR;
    spot_num INTEGER;
    sections CHAR[] := ARRAY['A', 'B', 'C'];
    spots_per_section INTEGER;
    spot_count INTEGER;
    random_status spot_status;
    random_rate DECIMAL;
BEGIN
    FOR loc IN SELECT id, "totalSpots" FROM parking_locations LOOP
        spots_per_section := CEIL(loc."totalSpots"::FLOAT / 3);
        spot_count := 0;

        FOREACH section IN ARRAY sections LOOP
            FOR spot_num IN 1..spots_per_section LOOP
                EXIT WHEN spot_count >= loc."totalSpots";

                -- Random status (70% available, 25% occupied, 5% other)
                IF random() < 0.70 THEN
                    random_status := 'available';
                ELSIF random() < 0.95 THEN
                    random_status := 'occupied';
                ELSE
                    random_status := 'maintenance';
                END IF;

                -- Random hourly rate between 3 and 10
                random_rate := 3 + (random() * 7);

                INSERT INTO parking_spots ("spotNumber", "locationId", status, "hourlyRate")
                VALUES (
                    section || '-' || LPAD(spot_num::TEXT, 3, '0'),
                    loc.id,
                    random_status,
                    ROUND(random_rate::NUMERIC, 2)
                )
                ON CONFLICT DO NOTHING;

                spot_count := spot_count + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ========================================
-- Verify Setup
-- ========================================

-- Display summary
SELECT 'Database Setup Complete!' AS status;

SELECT 'Tables Created:' AS info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT 'Data Summary:' AS info;
SELECT
    'Users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Parking Locations', COUNT(*) FROM parking_locations
UNION ALL
SELECT 'Parking Spots', COUNT(*) FROM parking_spots
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'OTPs', COUNT(*) FROM otps;

-- Show parking locations
SELECT
    name,
    city,
    "totalSpots",
    (SELECT COUNT(*) FROM parking_spots ps WHERE ps."locationId" = pl.id AND ps.status = 'available') AS "availableSpots"
FROM parking_locations pl;
