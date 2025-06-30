const express = require('express');
const { User } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * GET /api/users
 * Lista todos os usuários (usado para seleção de responsáveis em tickets)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'], // ⚠️ Sem senha
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

/**
 * GET /api/users/me
 * Retorna o usuário autenticado
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }, // Remove a senha
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar informações do usuário.' });
  }
});

module.exports = router;
