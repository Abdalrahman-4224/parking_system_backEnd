/**
 * Complete Database Setup Script
 * Creates database, syncs models, and optionally seeds sample data
 *
 * Usage: node scripts/setup.js
 */

const { Client } = require('pg');
const { execSync } = require('child_process');
const readline = require('readline');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'parking_system';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function createDatabase() {
  const client = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres'
  });

  try {
    console.log('\n🔌 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (checkResult.rows.length > 0) {
      console.log(`ℹ️  Database "${DB_NAME}" already exists.`);
      return true;
    }

    // Create database
    console.log(`📦 Creating database "${DB_NAME}"...`);
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`✅ Database "${DB_NAME}" created successfully!`);
    return true;

  } catch (error) {
    if (error.code === '42P04') {
      console.log(`ℹ️  Database "${DB_NAME}" already exists.`);
      return true;
    }
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function syncModels() {
  try {
    console.log('\n📋 Syncing database models...');

    const { sequelize } = require('../src/config/database');
    require('../src/models');

    await sequelize.authenticate();
    console.log('✅ Database connection verified');

    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized (tables created)');

    await sequelize.close();
    return true;

  } catch (error) {
    console.error('❌ Error syncing models:', error.message);
    return false;
  }
}

async function setup() {
  console.log('========================================');
  console.log('🚗 Parking System - Database Setup');
  console.log('========================================');
  console.log(`Database: ${DB_NAME}`);
  console.log(`Host: ${DB_HOST}:${DB_PORT}`);
  console.log(`User: ${DB_USER}`);
  console.log('========================================');

  // Step 1: Create Database
  console.log('\n📌 Step 1: Create Database');
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    console.error('\n❌ Failed to create database. Exiting.');
    process.exit(1);
  }

  // Step 2: Sync Models
  console.log('\n📌 Step 2: Sync Models (Create Tables)');
  const modelsSynced = await syncModels();
  if (!modelsSynced) {
    console.error('\n❌ Failed to sync models. Exiting.');
    process.exit(1);
  }

  // Step 3: Ask about seeding
  console.log('\n📌 Step 3: Sample Data');
  const seedAnswer = await askQuestion('Do you want to add sample data? (yes/no): ');

  if (seedAnswer === 'yes' || seedAnswer === 'y') {
    console.log('\n🌱 Running seed script...\n');
    try {
      execSync('node scripts/seedDatabase.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Seeding failed');
    }
  } else {
    console.log('\nℹ️  Skipping sample data.');
  }

  // Done!
  console.log('\n========================================');
  console.log('🎉 Setup Complete!');
  console.log('========================================');
  console.log('\nYour database is ready. Run the server with:');
  console.log('  npm run dev');
  console.log('\nAPI will be available at:');
  console.log('  http://localhost:3000/api/v1');
  console.log('========================================\n');

  process.exit(0);
}

// Run setup
setup();
