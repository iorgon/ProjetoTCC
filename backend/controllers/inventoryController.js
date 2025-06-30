const { InventoryItem, Client } = require('../models');

exports.listByClient = async (req, res) => {
  const { clientId } = req.params;
  try {
    const items = await InventoryItem.findAll({ where: { clientId } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar inventário.' });
  }
};

exports.create = async (req, res) => {
  const { clientId } = req.params;
  try {
    const item = await InventoryItem.create({ ...req.body, clientId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar item de inventário.' });
  }
};
// Editar item de inventário
exports.update = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado.' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar item.' });
  }
};

// Excluir item de inventário
exports.remove = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado.' });
    await item.destroy();
    res.json({ message: 'Item removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover item.' });
  }
};

// Editar item de inventário
exports.update = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado.' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar item.' });
  }
};

// Excluir item de inventário
exports.remove = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado.' });
    await item.destroy();
    res.json({ message: 'Item removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover item.' });
  }
};