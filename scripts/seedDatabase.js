/**
 * Database Seeding Script
 * Run this script to add sample data to the database
 *
 * Usage: node scripts/seedDatabase.js
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const { User, ParkingLocation, ParkingSpot, Booking } = require('../src/models');
const fs = require('fs');
const path = require('path');

// Sample parking locations data
// Sample parking locations data
const parkingLocations = [
  {
    name: 'مواقف شارع الربيعي',
    address: 'شارع الربيعي، زيونة، بغداد',
    city: 'Baghdad',
    latitude: 33.324393,
    longitude: 44.450333,
    totalSpots: 43,
    jsonFile: 'al_rubei.json'
  },
  {
    name: 'مواقف المنصور',
    address: 'شارع 14 رمضان، المنصور، بغداد',
    city: 'Baghdad',
    latitude: 33.315200,
    longitude: 44.366100,
    totalSpots: 100,
    jsonFile: 'mansour.json'
  },
  {
    name: 'مواقف اليرموك',
    address: 'اليرموك 4 شوارع، بغداد',
    city: 'Baghdad',
    latitude: 33.303000,
    longitude: 44.335000,
    totalSpots: 50,
    jsonFile: 'yarmouk.json'
  },
  {
    name: 'حي الجامعة',
    address: 'شارع الربيع، حي الجامعة، بغداد',
    city: 'Baghdad',
    latitude: 33.334000,
    longitude: 44.325000,
    totalSpots: 50,
    jsonFile: 'hai_al_jamia.json'
  }
];

// Generate parking spots for a location
function generateSpots(locationId, totalSpots, sections = ['A', 'B', 'C']) {
  const spots = [];
  let spotCount = 0;
  const spotsPerSection = Math.ceil(totalSpots / sections.length);

  for (const section of sections) {
    for (let i = 1; i <= spotsPerSection && spotCount < totalSpots; i++) {
      const spotNumber = `${section}-${String(i).padStart(3, '0')}`;

      // Randomly set some spots as occupied for testing
      const randomStatus = Math.random();
      let status = 'available';
      if (randomStatus < 0.3) status = 'occupied';
      else if (randomStatus < 0.35) status = 'reserved';
      else if (randomStatus < 0.38) status = 'maintenance';

      // Random hourly rate between 3 and 10
      const hourlyRate = (Math.floor(Math.random() * 8) + 3).toFixed(2);

      spots.push({
        spotNumber,
        locationId,
        status,
        hourlyRate,
        isActive: true
      });

      spotCount++;
    }
  }

  return spots;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Sync models (create tables if they don't exist)
    console.log('📋 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized\n');

    // Check if data already exists
    const existingLocations = await ParkingLocation.count();
    if (existingLocations > 0) {
      console.log('⚠️  Database already has data!');
      console.log(`   Found ${existingLocations} parking locations.\n`);

      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question('Do you want to delete existing data and reseed? (yes/no): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Seeding cancelled.');
        process.exit(0);
      }

      // Delete existing data
      console.log('\n🗑️  Deleting existing data...');
      await Booking.destroy({ where: {} });
      await ParkingSpot.destroy({ where: {} });
      await ParkingLocation.destroy({ where: {} });
      console.log('✅ Existing data deleted\n');
    }

    // Create parking locations
    console.log('🏢 Creating parking locations...');
    const createdLocations = [];
    const dataDir = path.join(__dirname, 'data');

    for (const locationData of parkingLocations) {
      // Read GeoJSON if available
      if (locationData.jsonFile) {
        try {
          const filePath = path.join(dataDir, locationData.jsonFile);
          if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf8');
            locationData.geoJson = JSON.parse(rawData);
            console.log(`   Found GeoJSON for ${locationData.name}`);
          }
        } catch (e) {
          console.error(`   Failed to read GeoJSON for ${locationData.name}: ${e.message}`);
        }
        delete locationData.jsonFile; // Remove from object so Sequelize doesn't complain
      }

      const location = await ParkingLocation.create(locationData);
      createdLocations.push(location);
      console.log(`   ✅ Created: ${location.name}`);
    }
    console.log(`\n✅ Created ${createdLocations.length} parking locations\n`);

    // Create parking spots for each location
    console.log('🅿️  Creating parking spots...');
    let totalSpotsCreated = 0;

    for (const location of createdLocations) {
      const spots = generateSpots(location.id, location.totalSpots);
      await ParkingSpot.bulkCreate(spots);
      totalSpotsCreated += spots.length;
      console.log(`   ✅ Created ${spots.length} spots for: ${location.name}`);
    }
    console.log(`\n✅ Created ${totalSpotsCreated} total parking spots\n`);

    // Display summary
    console.log('========================================');
    console.log('🎉 Database Seeding Complete!');
    console.log('========================================');
    console.log(`📍 Parking Locations: ${createdLocations.length}`);
    console.log(`🅿️  Parking Spots: ${totalSpotsCreated}`);
    console.log('========================================\n');

    // Display location details
    console.log('📍 Parking Locations Summary:\n');
    for (const location of createdLocations) {
      const spotCounts = await ParkingSpot.findAll({
        where: { locationId: location.id },
        attributes: ['status']
      });

      const available = spotCounts.filter(s => s.status === 'available').length;
      const occupied = spotCounts.filter(s => s.status === 'occupied').length;

      console.log(`   ${location.name}`);
      console.log(`   📍 ${location.address}, ${location.city}`);
      console.log(`   🌐 GPS: ${location.latitude}, ${location.longitude}`);
      console.log(`   🅿️  Spots: ${available} available / ${location.totalSpots} total`);
      console.log();
    }

    console.log('========================================');
    console.log('Next steps:');
    console.log('1. Run "npm run dev" to start the server');
    console.log('2. Test the API at http://localhost:3000/api/v1/locations');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run the script
seedDatabase();
