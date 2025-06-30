const express = require('express');
const { SLAConfig } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// GET uma config específica OU todas as configs
router.get('/sla-config', async (req, res) => {
  const { plan, priority } = req.query;

  if (plan && priority) {
    // Busca específica
    const slaConfig = await SLAConfig.findOne({
      where: { plan: plan.trim().toLowerCase(), priority: priority.trim().toLowerCase() },
      raw: true
    });
    if (!slaConfig) {
      return res.status(404).json({ error: 'SLAConfig não encontrada.' });
    }
    return res.json({
      startHours: slaConfig.startHours,
      solveHours: slaConfig.solveHours
    });
  }

  // Se não houver query params, retorna todas
  const configs = await SLAConfig.findAll();
  res.json(configs);
});

// PUT para atualizar (ou criar) configs (apenas admin)
router.put('/sla-config', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito' });
  const updates = req.body; // [{plan, priority, startHours, solveHours}, ...]
  for (const item of updates) {
    await SLAConfig.upsert(item);
  }
  res.json({ success: true });
});

module.exports = router;
