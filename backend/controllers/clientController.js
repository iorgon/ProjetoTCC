const { Client } = require('../models');

// Listar todos os clientes
exports.list = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
};

// Buscar um cliente pelo id
exports.getById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cliente.' });
  }
};

// Cadastrar cliente
exports.create = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
};

// Editar cliente
exports.update = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
    await client.update(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
};

// Excluir cliente
exports.remove = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
    await client.destroy();
    res.json({ message: 'Cliente removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover cliente.' });
  }
};