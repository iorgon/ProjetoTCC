module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'technician'),
      defaultValue: 'user',
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Ticket, { foreignKey: 'userId', as: 'tickets' });
    User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
    User.hasMany(models.Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
    User.hasMany(models.Log, { foreignKey: 'userId', as: 'logs' });
  };

  return User;
};
