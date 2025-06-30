module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    name: { type: DataTypes.STRING, allowNull: false },
    cnpj: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    plan: {
      type: DataTypes.ENUM('basic', 'premium'),
      allowNull: false,
      defaultValue: 'basic'
    }
  });

  Client.associate = (models) => {
    Client.hasMany(models.InventoryItem, { foreignKey: 'clientId', as: 'inventory' });
    Client.hasMany(models.Ticket, { foreignKey: 'clientId', as: 'tickets' });
  };

  return Client;
};
