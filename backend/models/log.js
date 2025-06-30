module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    message: { type: DataTypes.STRING, allowNull: false },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Tickets', key: 'id' }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    }
  });

  Log.associate = (models) => {
    Log.belongsTo(models.Ticket, { foreignKey: 'ticketId', as: 'ticket' });
    Log.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Log;
};
