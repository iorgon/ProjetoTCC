const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Listar todos
router.get('/clients', clientController.list);
// Buscar um cliente
router.get('/clients/:id', clientController.getById);
// Cadastrar novo cliente
router.post('/clients', clientController.create);
// Editar cliente
router.put('/clients/:id', clientController.update);
// Deletar cliente
router.delete('/clients/:id', clientController.remove);

module.exports = router;
