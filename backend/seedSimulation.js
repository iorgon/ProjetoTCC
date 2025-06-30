const bcrypt = require('bcryptjs');
const { sequelize, User, Ticket, Client, Inventory } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    // 1. Crie 10 clientes
    const clientList = [];
    for (let i = 1; i <= 10; i++) {
      const client = await Client.create({
        name: `Cliente ${i}`,
        cnpj: `00000000000${i}`,
        email: `cliente${i}@mail.com`,
        phone: `3199999999${i}`,
        notes: `Cliente de teste ${i}`,
        plan: i % 2 === 0 ? 'premium' : 'basic'
      });
      clientList.push(client);
    }

    // 2. Crie 2 técnicos e 3 usuários
    const userList = [];
    for (let i = 1; i <= 2; i++) {
      userList.push(await User.create({
        name: `Técnico ${i}`,
        email: `tecnico${i}@mail.com`,
        password: await bcrypt.hash('123456', 10),
        role: 'technician'
      }));
    }
    for (let i = 1; i <= 3; i++) {
      userList.push(await User.create({
        name: `Usuário ${i}`,
        email: `usuario${i}@mail.com`,
        password: await bcrypt.hash('123456', 10),
        role: 'user'
      }));
    }

    // 3. Crie 30 tickets variados com slaStart e slaSolve obrigatórios
    const priorities = ['low', 'medium', 'high'];
    const categories = ['financeiro', 'suporte', 'atendimento', 'infraestrutura', 'logistica', 'administrativo', 'comercial', 'seguranca', 'rh'];
    const statuses = ['open', 'in_progress', 'closed'];

    for (let i = 1; i <= 30; i++) {
      const now = new Date();
      const slaStart = new Date(now);
      // SLA de 8h a 72h a partir de agora
      const slaSolve = new Date(now.getTime() + (Math.floor(Math.random() * 64) + 8) * 60 * 60 * 1000);

      await Ticket.create({
        title: `Ticket #${i}`,
        description: `Descrição do ticket ${i}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignedTo: userList[Math.floor(Math.random() * 2)].id, // um dos técnicos
        userId: userList[Math.floor(Math.random() * userList.length)].id, // qualquer user
        clientId: clientList[Math.floor(Math.random() * clientList.length)].id, // qualquer cliente
        slaStart: slaStart,
        slaSolve: slaSolve
      });
    }

    // 4. Crie 5 inventários para clientes aleatórios
    for (let i = 1; i <= 5; i++) {
      await Inventory.create({
        clientId: clientList[Math.floor(Math.random() * clientList.length)].id,
        name: `Item Inventário ${i}`,
        type: ['Notebook', 'Roteador', 'Switch'][Math.floor(Math.random() * 3)],
        serialNumber: `SN000${i}`,
        acquisitionDate: new Date(2021, i % 12, 1),
        status: i % 2 === 0 ? 'Ativo' : 'Manutenção',
        notes: `Observação ${i}`
      });
    }

    console.log('Base de simulação populada com sucesso!');
    process.exit();
  } catch (error) {
    console.error('Erro ao popular base de simulação:', error);
    process.exit(1);
  }
}

seed();
