module.exports = (sequelize, DataTypes) => {
  const ClientDocument = sequelize.define('ClientDocument', {
    filename: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    uploadedAt: { type: DataTypes.DATE, allowNull: false },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Clients', key: 'id' }
    }
  });

  ClientDocument.associate = (models) => {
    ClientDocument.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
  };

  return ClientDocument;
};
