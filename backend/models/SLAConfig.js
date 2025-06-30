module.exports = (sequelize, DataTypes) => {
  const SLAConfig = sequelize.define('SLAConfig', {
    plan: {
      type: DataTypes.ENUM('basic', 'premium'),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false
    },
    startHours: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    solveHours: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'slaconfigs',
    indexes: [
      {
        unique: true,
        fields: ['plan', 'priority']
      }
    ]
  });

  return SLAConfig;
};
