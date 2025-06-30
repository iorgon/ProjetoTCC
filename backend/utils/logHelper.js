const { Log } = require('../models');

async function createLog({ ticketId, userId, message }) {
  try {
    await Log.create({ ticketId, userId, message });
  } catch (error) {
    console.error('Erro ao registrar log:', error.message);
  }
}

module.exports = { createLog };
