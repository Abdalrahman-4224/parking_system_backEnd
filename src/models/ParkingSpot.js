const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParkingSpot = sequelize.define('ParkingSpot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  spotNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'parking_locations',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance'),
    defaultValue: 'available',
    allowNull: false
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 5.00
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'parking_spots',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['locationId', 'spotNumber']
    }
  ]
});

module.exports = ParkingSpot;
