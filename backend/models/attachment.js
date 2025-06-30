module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id',
      },
    },
  });

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Ticket, {
      foreignKey: 'ticketId',
      as: 'ticket',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Attachment;
};
