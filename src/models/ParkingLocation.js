const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParkingLocation = sequelize.define('ParkingLocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  totalSpots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  geoJson: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'parking_locations',
  timestamps: true
});

module.exports = ParkingLocation;
