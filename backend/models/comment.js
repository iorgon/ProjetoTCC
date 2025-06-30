module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    message: { type: DataTypes.TEXT, allowNull: false },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Tickets', key: 'id' }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    }
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Ticket, { foreignKey: 'ticketId', as: 'ticket' });
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
  };

  return Comment;
};
