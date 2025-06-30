require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // <-- Importa o bcrypt
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const clientRoutes = require('./routes/clientRoutes');
const clientDocumentRoutes = require('./routes/clientDocumentRoutes');
const slaConfigRoutes = require('./routes/slaConfigRoutes');
const { sequelize, SLAConfig, User } = require('./models'); 

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
      .then(async () => {
        console.log('Modelos sincronizados com o banco de dados.');

        // ----------- SLAs padrões -----------
        const slaCount = await SLAConfig.count();
        if (slaCount === 0) {
          await SLAConfig.bulkCreate([
            { plan: 'basic', priority: 'low',    startHours: 24, solveHours: 72 },
            { plan: 'basic', priority: 'medium', startHours: 8,  solveHours: 24 },
            { plan: 'basic', priority: 'high',   startHours: 2,  solveHours: 8  },
            { plan: 'premium', priority: 'low',    startHours: 12, solveHours: 36 },
            { plan: 'premium', priority: 'medium', startHours: 4,  solveHours: 12 },
            { plan: 'premium', priority: 'high',   startHours: 1,  solveHours: 4  },
          ]);
          console.log('SLAs padrões criados!');
        } else {
          console.log('SLAs já existentes, não foi necessário criar.');
        }

        // ----------- Usuario admin padrão -----------
        const adminEmail = 'admin@example.com'; // Altere para o email desejado
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash('123456', 10); // Altere para a senha desejada
          await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
          });
          console.log('Usuário admin padrão criado!');
        } else {
          console.log('Usuário admin padrão já existe, não foi necessário criar.');
        }

        app.listen(PORT, () => {
          console.log(`Servidor rodando na porta ${PORT}`);
        });
      })
      .catch((err) => {
        console.error('Erro ao sincronizar os modelos com o banco de dados:', err);
      });
  })
  .catch((err) => console.log('Erro ao conectar com o banco de dados:', err));
