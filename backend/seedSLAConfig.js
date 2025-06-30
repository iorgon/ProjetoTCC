const { SLAConfig, sequelize } = require('./models');

async function seed() {
  await sequelize.sync();
  await SLAConfig.bulkCreate([
    { plan: 'basic', priority: 'low', hours: 48 },
    { plan: 'basic', priority: 'medium', hours: 24 },
    { plan: 'basic', priority: 'high', hours: 8 },
    { plan: 'premium', priority: 'low', hours: 24 },
    { plan: 'premium', priority: 'medium', hours: 12 },
    { plan: 'premium', priority: 'high', hours: 4 },
  ], { ignoreDuplicates: true });
  console.log('Seed realizado!');
  process.exit();
}
seed();
