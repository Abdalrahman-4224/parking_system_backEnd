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
    totalSpots: 736,
    jsonFile: 'al_rubei.json',
    zoneGeoJson: {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "coordinates": [
              [
                [44.44568407285601, 33.31939685148011],
                [44.45559090417595, 33.32839403222533],
                [44.45544131589327, 33.32862292761692],
                [44.44546137297999, 33.31962441269745],
                [44.44568407285601, 33.31939685148011]
              ]
            ],
            "type": "Polygon"
          }
        }
      ]
    }
  },
  {
    name: 'مواقف المنصور',
    address: 'شارع 14 رمضان، المنصور، بغداد',
    city: 'Baghdad',
    latitude: 33.315200,
    longitude: 44.366100,
    totalSpots: 2000,
    jsonFile: 'mansour.json',
    zoneGeoJson: {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "coordinates": [
              [
                [44.34135688609399, 33.305019729449214],
                [44.34121263226862, 33.30512851725355],
                [44.34106335441547, 33.30555431793191],
                [44.33811893330781, 33.31496718015133],
                [44.33829659334182, 33.31820565603486],
                [44.36495672276581, 33.31534694204424],
                [44.36536653289136, 33.315729235552965],
                [44.33833220692688, 33.31847423601579],
                [44.33861453575241, 33.324633020699366],
                [44.338191688241864, 33.32463188616396],
                [44.337799278826424, 33.31495323179216],
                [44.34092966335109, 33.30494743116938],
                [44.34135688609399, 33.305019729449214]
              ]
            ],
            "type": "Polygon"
          }
        }
      ]
    }
  },
  {
    name: 'مواقف اليرموك',
    address: 'اليرموك 4 شوارع، بغداد',
    city: 'Baghdad',
    latitude: 33.303000,
    longitude: 44.335000,
    totalSpots: 952,
    jsonFile: 'yarmouk.json',
    zoneGeoJson: {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "coordinates": [
              [
                [44.33416408930319, 33.30487549355301],
                [44.33409784870457, 33.304570158428334],
                [44.33401667090004, 33.304339489548155],
                [44.334004214361784, 33.30410525800524],
                [44.334111728807386, 33.30381410797905],
                [44.33422988495445, 33.30360431688611],
                [44.33453167268692, 33.30333712917029],
                [44.348926681257126, 33.29208217532192],
                [44.34925254512794, 33.29244311125929],
                [44.34781356895721, 33.29353782918713],
                [44.334801561627415, 33.30368286021999],
                [44.334633339659064, 33.303931692985444],
                [44.33454439675742, 33.304309199430065],
                [44.334590509050486, 33.30478000310879],
                [44.33416408930319, 33.30487549355301]
              ]
            ],
            "type": "Polygon"
          }
        }
      ]
    }
  },
  {
    name: 'حي الجامعة',
    address: 'شارع الربيع، حي الجامعة، بغداد',
    city: 'Baghdad',
    latitude: 33.334000,
    longitude: 44.325000,
    totalSpots: 3000,
    jsonFile: 'hai_al_jamia.json',
    zoneGeoJson: {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "coordinates": [
              [
                [44.32339269833952, 33.29256352214614],
                [44.32343880048683, 33.29376672133509],
                [44.325067941625434, 33.33585441233754],
                [44.33224314818429, 33.35038033195201],
                [44.33330931040385, 33.35370055577691],
                [44.33341555958404, 33.35414338032746],
                [44.33353261580126, 33.355012871063025],
                [44.33360920173487, 33.35546961046147],
                [44.334488382837975, 33.35844279665041],
                [44.33471613785309, 33.35885712863656],
                [44.334353838694625, 33.35906165379507],
                [44.334177405341364, 33.3587171436739],
                [44.33408236116301, 33.35843871491774],
                [44.33388715085832, 33.35769850987876],
                [44.33317472231437, 33.35514949565662],
                [44.33306502859239, 33.35419641312144],
                [44.331872420930665, 33.35048918948823],
                [44.331142585884834, 33.34900305398166],
                [44.324696956169134, 33.33588488184522],
                [44.32305316674004, 33.29257722660358],
                [44.32339269833952, 33.29256352214614]
              ]
            ],
            "type": "Polygon"
          }
        }
      ]
    }
  }
];

// Generate parking spots for a location

function generateSpots(locationId, totalSpots) {
  const spots = [];

  for (let i = 1; i <= totalSpots; i++) {
    const spotNumber = String(i);

    // All spots are initially available
    const status = 'available';

    // Random hourly rate between 3 and 10
    const hourlyRate = (Math.floor(Math.random() * 8) + 3).toFixed(2);

    spots.push({
      spotNumber,
      locationId,
      status,
      hourlyRate,
      isActive: true
    });
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
