module.exports = (sequelize, DataTypes) => {
  const InventoryItem = sequelize.define('InventoryItem', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    serialNumber: { type: DataTypes.STRING, allowNull: true },
    acquisitionDate: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Clients', key: 'id' }
    }
  });

  InventoryItem.associate = (models) => {
    InventoryItem.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
  };

  return InventoryItem;
};
