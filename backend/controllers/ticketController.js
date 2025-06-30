const { Ticket, Client } = require('../models');
const { createLog } = require('../utils/logHelper');

exports.createTicket = async (req, res) => {
  try {
    console.log("Recebido no backend:", req.body);

    const { title, description, priority, category, assignedTo, clientId, slaStart, slaSolve } = req.body;

    if (!title || !description || !priority || !category || !clientId || !slaStart || !slaSolve) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: title, description, priority, category, clientId, slaStart e slaSolve são necessários.'
      });
    }

    const ticketData = {
      title,
      description,
      priority,
      category,
      assignedTo: assignedTo || null,
      clientId,
      slaStart,
      slaSolve,
      status: 'open',
      userId: req.user?.id,
    };

    const ticket = await Ticket.create(ticketData);

    await createLog?.({
      action: 'CREATE_TICKET',
      description: `Ticket ${ticket.id} criado (SLA recebido do frontend).`,
      userId: req.user?.id,
      ticketId: ticket.id
    });

    return res.status(201).json(ticket);

  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: err.message,
        details: err.errors?.map(e => ({
          path: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }
    return res.status(500).json({ error: err.message });
  }
};
