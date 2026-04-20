require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkData() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const res = await client.query('SELECT * FROM parking_locations');
        console.log(`Found ${res.rows.length} locations.`);

        for (const row of res.rows) {
            console.log(`\nLocation: ${row.name}`);
            console.log('Keys:', Object.keys(row));
            if (row.geoJson) {
                console.log('✅ geoJson PRESENT in DB (Raw SQL)');
                console.log('Type:', typeof row.geoJson);
                // console.log('Preview:', JSON.stringify(row.geoJson).substring(0, 100));
            } else if (row.geojson) {
                console.log('✅ geojson (lowercase) PRESENT in DB');
            } else if (row['"geoJson"']) {
                console.log('✅ "geoJson" (quoted) PRESENT in DB');
            } else {
                console.log('❌ geoJson MISSING/NULL in DB');
                // Check for any column resembling geojson
                const keys = Object.keys(row).filter(k => k.toLowerCase().includes('geo'));
                if (keys.length > 0) {
                    console.log('   Found similar columns:', keys);
                }
            }
        }

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

checkData();
