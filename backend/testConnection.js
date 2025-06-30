const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ticket_system', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

sequelize.authenticate()
  .then(() => {
    console.log('Conexão bem-sucedida com o banco de dados!');
  })
  .catch((err) => {
    console.error('Erro ao conectar com o banco de dados:', err);
  });
