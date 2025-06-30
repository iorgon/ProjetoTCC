module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'closed'),
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalTimeSpent: {
      type: DataTypes.INTEGER, // em minutos
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        'financeiro',
        'suporte',
        'atendimento',
        'infraestrutura',
        'logistica',
        'administrativo',
        'comercial',
        'seguranca',
        'rh'
      ),
      defaultValue: 'suporte',
    },
    slaStart: {  // Prazo para iniciar atendimento
      type: DataTypes.DATE,
      allowNull: false,
    },
    slaSolve: {  // Prazo para solucionar ticket
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  });

  Ticket.associate = (models) => {
    Ticket.hasMany(models.Attachment, {
      foreignKey: 'ticketId',
      as: 'attachments',
    });
    Ticket.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'creator',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    Ticket.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignedTechnician',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    Ticket.hasMany(models.Comment, {
      foreignKey: 'ticketId',
      as: 'comments',
    });

    Ticket.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'client',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    if (models.Log) {
      Ticket.hasMany(models.Log, {
        foreignKey: 'ticketId',
        as: 'logs',
      });
    }
  };

  return Ticket;
};
