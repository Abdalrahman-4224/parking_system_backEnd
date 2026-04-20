/**
 * Database Creation Script
 * Run this script to create the PostgreSQL database
 *
 * Usage: node scripts/createDatabase.js
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'parking_system';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

async function createDatabase() {
  // Connect to PostgreSQL server (not to a specific database)
  const client = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    console.log('🔌 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL server\n');

    // Check if database already exists
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (checkResult.rows.length > 0) {
      console.log(`ℹ️  Database "${DB_NAME}" already exists.`);
      console.log('   Skipping database creation.\n');
    } else {
      // Create the database
      console.log(`📦 Creating database "${DB_NAME}"...`);
      await client.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`✅ Database "${DB_NAME}" created successfully!\n`);
    }

    console.log('========================================');
    console.log('Database Setup Complete!');
    console.log('========================================');
    console.log(`Database Name: ${DB_NAME}`);
    console.log(`Host: ${DB_HOST}`);
    console.log(`Port: ${DB_PORT}`);
    console.log(`User: ${DB_USER}`);
    console.log('========================================\n');

    console.log('Next steps:');
    console.log('1. Run "npm run dev" to start the server');
    console.log('   (Tables will be created automatically)');
    console.log('2. Or run "node scripts/seedDatabase.js" to add sample data\n');

  } catch (error) {
    if (error.code === '42P04') {
      console.log(`ℹ️  Database "${DB_NAME}" already exists.`);
    } else {
      console.error('❌ Error creating database:', error.message);
      process.exit(1);
    }
  } finally {
    await client.end();
    console.log('🔌 Disconnected from PostgreSQL server.');
  }
}

// Run the script
createDatabase();
