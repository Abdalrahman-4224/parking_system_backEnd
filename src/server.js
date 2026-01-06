const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Database models synchronized');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n========================================`);
      console.log(`🚗 Parking System API Server`);
      console.log(`========================================`);
      console.log(`Server running on port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Local: http://localhost:${PORT}/api/v1`);
      console.log(`Network: http://YOUR_IP_ADDRESS:${PORT}/api/v1`);
      console.log(`Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
