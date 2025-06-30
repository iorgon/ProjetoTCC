const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { Ticket, User, Comment, Log, Attachment, Client, SLAConfig } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const ticketController = require('../controllers/ticketController');

const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// --- Relatórios detalhados ---
router.get('/reports/by-client', authMiddleware, async (req, res) => {
  try {
    const result = await Ticket.findAll({
      attributes: [
        'clientId',
        [Sequelize.fn('COUNT', Sequelize.col('Ticket.id')), 'totalTickets']
      ],
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'cnpj', 'email', 'phone'] }
      ],
      group: ['clientId'],
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por cliente.' });
  }
});

router.get('/reports/by-technician', authMiddleware, async (req, res) => {
  try {
    const result = await Ticket.findAll({
      attributes: [
        'assignedTo',
        [Sequelize.fn('COUNT', Sequelize.col('Ticket.id')), 'totalTickets']
      ],
      include: [
        { model: User, as: 'assignedTechnician', attributes: ['id', 'name', 'email'] }
      ],
      where: { assignedTo: { [Sequelize.Op.not]: null } },
      group: ['assignedTo'],
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório por técnico.' });
  }
});

router.get('/reports/sla-expired', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const result = await Ticket.findAll({
      where: {
        status: { [Sequelize.Op.not]: 'closed' },
        slaSolve: { [Sequelize.Op.lt]: now }
      },
      include: [
        { model: Client, as: 'client', attributes: ['name'] }
      ]
    });
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar tickets com SLA vencido:', error);
    res.status(500).json({ error: 'Erro ao buscar tickets com SLA vencido.', details: error.message });
  }
});



router.get('/reports/average-resolution', authMiddleware, async (req, res) => {
  try {
    const result = await Ticket.findAll({
      attributes: [
        'assignedTo',
        [Sequelize.fn('AVG', Sequelize.col('totalTimeSpent')), 'avgTime']
      ],
      where: {
        status: 'closed',
        totalTimeSpent: { [Sequelize.Op.not]: null }
      },
      include: [
        { model: User, as: 'assignedTechnician', attributes: ['id', 'name', 'email'] }
      ],
      group: ['assignedTo'],
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular tempo médio de resolução.' });
  }
});


// Técnicos com mais tickets abertos no momento
router.get('/reports/active-by-technician', authMiddleware, async (req, res) => {
  try {
    const result = await Ticket.findAll({
      where: { status: { [Sequelize.Op.not]: 'closed' }, assignedTo: { [Sequelize.Op.not]: null } },
      attributes: [
        'assignedTo',
        [Sequelize.fn('COUNT', Sequelize.col('Ticket.id')), 'openTickets']
      ],
      include: [
        { model: User, as: 'assignedTechnician', attributes: ['name', 'email'] }
      ],
      group: ['assignedTo'],
      order: [[Sequelize.literal('openTickets'), 'DESC']]
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar ranking de técnicos.' });
  }
});

// Tickets fechados no mês por cada técnico
router.get('/reports/closed-by-month-technician', authMiddleware, async (req, res) => {
  try {
    const result = await Ticket.findAll({
      where: {
        status: 'closed',
        assignedTo: { [Sequelize.Op.not]: null }
      },
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('Ticket.updatedAt')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('Ticket.updatedAt')), 'month'],
        'assignedTo',
        [Sequelize.fn('COUNT', Sequelize.col('Ticket.id')), 'closedTickets']
      ],
      include: [
        { model: User, as: 'assignedTechnician', attributes: ['name', 'email'] }
      ],
      group: ['year', 'month', 'assignedTo'],
      order: [['year', 'DESC'], ['month', 'DESC'], [Sequelize.literal('closedTickets'), 'DESC']]
    });
    return res.json(result); 
  } catch (error) {
    console.error('Erro ao gerar relatório de fechados por técnico:', error);
    return res.status(500).json({ error: error.message, details: error });
  }
});

// --- Fim dos relatórios ---

// Criar ticket
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, category, assignedTo, clientId } = req.body;

    if (!title || !description || !priority || !category || !clientId) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: title, description, priority, category e clientId são necessários.'
      });
    }

    // Busca plano do cliente
    const client = await Client.findByPk(clientId, { attributes: ['plan'], raw: true });
    if (!client) {
      return res.status(400).json({ error: `Cliente com ID ${clientId} não encontrado.` });
    }
    const plan = client.plan.trim().toLowerCase();
    const prio = priority.trim().toLowerCase();

    // Busca o SLAConfig no banco
    const slaConfig = await SLAConfig.findOne({ where: { plan, priority: prio }, raw: true });
    if (!slaConfig) {
      const available = await SLAConfig.findAll({ attributes: ['plan', 'priority'], raw: true });
      return res.status(400).json({
        error: `SLAConfig não encontrada para plano='${plan}' e priority='${prio}'.`,
        available
      });
    }

    // Calcula os prazos
    const now = new Date();
    const slaStart = new Date(now.getTime() + Number(slaConfig.startHours) * 60 * 60 * 1000);
    const slaSolve = new Date(now.getTime() + Number(slaConfig.solveHours) * 60 * 60 * 1000);

    // Cria o ticket
    const ticket = await Ticket.create({
      title,
      description,
      priority: prio,
      category,
      slaStart,
      slaSolve,
      assignedTo: assignedTo || null,
      clientId,
      userId: req.user.id,
      status: 'open',
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});
router.post('/', authMiddleware, ticketController.createTicket);


// Listar tickets com filtros e include do cliente
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, priority, category, assignedTo } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedTo) where.assignedTo = assignedTo;

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTechnician', attributes: ['id', 'name', 'email'] },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cnpj', 'email', 'phone'],
        },
      ],
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar tickets.' });
  }
});

// Dashboard de métricas
router.get('/metrics/dashboard', authMiddleware, async (req, res) => {
  try {
    const now = new Date();

    const [
      totalOpen,
      totalClosed,
      low,
      medium,
      high,
      totalSLAExpired,
      inProgress,
      avgResolution
    ] = await Promise.all([
      Ticket.count({ where: { status: 'open' } }),
      Ticket.count({ where: { status: 'closed' } }),
      Ticket.count({ where: { priority: 'low' } }),
      Ticket.count({ where: { priority: 'medium' } }),
      Ticket.count({ where: { priority: 'high' } }),
      // SLA vencido: em aberto e prazo de SLA já estourado
      Ticket.count({ where: { status: { [Sequelize.Op.not]: 'closed' }, slaSolve: { [Sequelize.Op.lt]: now } } }),
      Ticket.count({ where: { status: 'in_progress' } }),
      // Tempo médio de resolução (apenas tickets fechados)
      Ticket.findAll({
        where: { status: 'closed', totalTimeSpent: { [Sequelize.Op.not]: null } },
        attributes: [[Sequelize.fn('AVG', Sequelize.col('totalTimeSpent')), 'avgTime']],
        raw: true,
      })
    ]);

    // Pegando a média do resultado da query
    const avgTime = avgResolution[0]?.avgTime
      ? Math.round(Number(avgResolution[0].avgTime))
      : 0;

    res.json({
      open: totalOpen,
      closed: totalClosed,
      inProgress,
      slaExpired: totalSLAExpired,
      total: totalOpen + totalClosed,
      priorities: { low, medium, high },
      avgResolution: avgTime // em minutos
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar métricas.', details: error.message });
  }
});


// Detalhes do ticket
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTechnician', attributes: ['id', 'name', 'email'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
        },
        {
          model: Log,
          as: 'logs',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
        {
          model: Attachment,
          as: 'attachments',
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cnpj', 'email', 'phone'],
        },
      ],
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ticket.' });
  }
});

// Adicionar comentário
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const comment = await Comment.create({
      message,
      ticketId: req.params.id,
      userId: req.user.id,
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
    });

    res.status(201).json(commentWithAuthor);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar comentário.' });
  }
});

// Atualizar ticket com suporte a startedAt e totalTimeSpent
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });

    const updates = {};
    const logs = [];

    const isOwner = ticket.userId === userId;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin && req.body.status !== 'in_progress') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    // Início do atendimento
    if (req.body.status === 'in_progress') {
      if (!ticket.startedAt) {
        updates.startedAt = new Date();
        logs.push({ ticketId: ticket.id, userId, message: `Atendimento iniciado por ${req.user.name}` });
      }
      if (!ticket.assignedTo) {
        updates.assignedTo = userId;
        logs.push({ ticketId: ticket.id, userId, message: `Responsável atribuído automaticamente para ${req.user.name}` });
      }
    }

    // Fechamento
    if (req.body.status === 'closed' && ticket.startedAt && !ticket.totalTimeSpent) {
      const now = new Date();
      const diffMin = Math.round((now - new Date(ticket.startedAt)) / 60000);
      updates.totalTimeSpent = diffMin;
      logs.push({ ticketId: ticket.id, userId, message: `Ticket fechado após ${diffMin} minutos` });
    }

    const trackFields = ['status', 'priority', 'category', 'assignedTo', 'sla'];
    for (const field of trackFields) {
      if (req.body[field] !== undefined && req.body[field] !== ticket[field]) {
        logs.push({
          ticketId: ticket.id,
          userId,
          message: `${field} alterado de '${ticket[field]}' para '${req.body[field]}'`,
        });
        updates[field] = req.body[field];
      }
    }

    await ticket.update(updates);
    if (logs.length > 0) await Log.bulkCreate(logs);

    res.json({ message: 'Ticket atualizado com sucesso.', ticket });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar ticket.' });
  }
});

// Upload de anexos
router.post('/:id/attachments', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const ticketId = req.params.id;
    const attachment = await Attachment.create({
      filename: req.file.originalname,
      path: req.file.filename,
      ticketId,
    });

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload.' });
  }
});

// Baixar anexo
router.get('/:ticketId/attachments/:filename', authMiddleware, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado.' });
    }

    res.download(filePath, req.params.filename);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer download.' });
  }
});

module.exports = router;
