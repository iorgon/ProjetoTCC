const { ClientDocument } = require('../models');
const path = require('path');

// Listar documentos do cliente
exports.list = async (req, res) => {
  const { clientId } = req.params;
  const docs = await ClientDocument.findAll({ where: { clientId } });
  res.json(docs);
};

// Upload
exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
  const { clientId } = req.params;
  const { description } = req.body;
  const doc = await ClientDocument.create({
    clientId,
    filename: req.file.originalname,
    path: req.file.filename,
    description
  });
  res.status(201).json(doc);
};

// Download
exports.download = async (req, res) => {
  const { id } = req.params;
  const doc = await ClientDocument.findByPk(id);
  if (!doc) return res.status(404).json({ error: 'Arquivo não encontrado' });
  res.download(path.join(__dirname, '../uploads', doc.path), doc.filename);
};

// Excluir
exports.remove = async (req, res) => {
  const { id } = req.params;
  const doc = await ClientDocument.findByPk(id);
  if (!doc) return res.status(404).json({ error: 'Arquivo não encontrado' });
  await doc.destroy();
  res.json({ message: 'Arquivo removido com sucesso' });
};
