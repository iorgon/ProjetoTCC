require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const clientRoutes = require('./routes/clientRoutes');
const clientDocumentRoutes = require('./routes/clientDocumentRoutes');
const slaConfigRoutes = require('./routes/slaConfigRoutes');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', clientRoutes);
app.use('/api', clientDocumentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', slaConfigRoutes);




const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida.');

    sequelize
      .sync({ alter: true })
      .then(() => {
        console.log('Modelos sincronizados com o banco de dados.');
        app.listen(PORT, () => {
          console.log(`Servidor rodando na porta ${PORT}`);
        });
      })
      .catch((err) => {
        console.error('Erro ao sincronizar os modelos com o banco de dados:', err);
      });
  })
  .catch((err) => console.log('Erro ao conectar com o banco de dados:', err));
