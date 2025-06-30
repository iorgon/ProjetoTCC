const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Listar itens de inventário de um cliente
router.get('/clients/:clientId/inventory', inventoryController.listByClient);
// Adicionar item ao inventário de um cliente
router.post('/clients/:clientId/inventory', inventoryController.create);
// Editar item ao inventário de um cliente
router.put('/inventory/:id', inventoryController.update);
// Apagar item ao inventário de um cliente
router.delete('/inventory/:id', inventoryController.remove);


module.exports = router;
