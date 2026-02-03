/**
 * Update GeoJSON Schema and Data Script
 * Run this script to update the database schema and seed GeoJSON data.
 *
 * Usage: node scripts/update_geojson_schema.js
 */

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Determine database config
const DB_NAME = process.env.DB_NAME || 'parking_system';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

async function runUpdate() {
    console.log('🚀 Starting Database Update...');

    // Initialize Sequelize
    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        dialect: 'postgres',
        port: DB_PORT,
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // 1. Add Column
        console.log('🛠️  Adding "geoJson" column to "parking_locations" table...');
        try {
            await sequelize.query('ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS "geoJson" JSONB;');
            console.log('   - Column "geoJson" added (or already exists).');
        } catch (e) {
            console.log('   - Warning adding column:', e.message);
        }

        // 2. Read Data
        console.log('📂 Reading GeoJSON data from scripts/data/ ...');
        const dataDir = path.join(__dirname, 'data');

        // Helper to read JSON safely
        const readJson = (file) => {
            try {
                return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            } catch (e) {
                console.error(`ERROR reading ${file}:`, e.message);
                return null;
            }
        };

        const locationsData = [
            { searchName: 'مواقف شارع الربيعي', file: 'al_rubei.json' },
            { searchName: 'مواقف المنصور', file: 'mansour.json' },
            { searchName: 'مواقف اليرموك', file: 'yarmouk.json' },
            { searchName: 'حي الجامعة', file: 'hai_al_jamia.json' }
        ];

        // 3. Update Data
        console.log('💾 Updating Location Data...');
        for (const item of locationsData) {
            const geoJsonData = readJson(item.file);
            if (!geoJsonData) continue;

            const records = await sequelize.query(
                `SELECT id, name FROM parking_locations WHERE name LIKE :search`,
                {
                    replacements: { search: `%${item.searchName}%` },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (records.length > 0) {
                const id = records[0].id;
                await sequelize.query(
                    `UPDATE parking_locations SET "geoJson" = :geoJson WHERE id = :id`,
                    {
                        replacements: { geoJson: JSON.stringify(geoJsonData), id: id }
                    }
                );
                console.log(`   - Updated ${records[0].name} (ID: ${id})`);
            } else {
                console.log(`   - Location matching "${item.searchName}" not found. Skipping.`);
            }
        }

        // 4. Reset Spots
        console.log('🔄 Resetting all parking spots to "available"...');
        await sequelize.query(`UPDATE parking_spots SET status = 'available';`);
        console.log('   - All spots set to available.');

        console.log('\n========================================');
        console.log('✅ UPDATE COMPLETE SUCCESSFULLY');
        console.log('========================================');

    } catch (error) {
        console.error('❌ CRITICAL ERROR:', error);
    } finally {
        await sequelize.close();
    }
}

runUpdate();
