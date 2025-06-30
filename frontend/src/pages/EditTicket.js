import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [form, setForm] = useState({});
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await api.get(`/tickets/${id}`);
        const usersRes = await api.get('/users');
        const clientsRes = await api.get('/clients');

        setTicket(ticketRes.data);
        setUsers(usersRes.data);
        setClients(clientsRes.data);

        setForm({
          title: ticketRes.data.title,
          description: ticketRes.data.description,
          status: ticketRes.data.status,
          priority: ticketRes.data.priority,
          category: ticketRes.data.category,
          sla: ticketRes.data.sla ? ticketRes.data.sla.slice(0, 16) : '',
          assignedTo: ticketRes.data.assignedTechnician?.id || '',
          clientId: ticketRes.data.client?.id || ''
        });
      } catch (error) {
        console.error('Erro ao carregar ticket, usuários ou clientes:', error);
        navigate('/tickets');
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
        clientId: form.clientId || null
      };

      await api.put(`/tickets/${id}`, payload);
      setMessage('Ticket atualizado com sucesso.');
      setTimeout(() => navigate(`/tickets/${id}`), 1000);
    } catch (err) {
      console.error('Erro ao atualizar ticket:', err);
      setMessage('Erro ao atualizar ticket.');
    }
  };

  if (!ticket) return <div className="max-w-2xl mx-auto p-8">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Editar Ticket #{ticket.id}</h2>
      {message && (
        <div className={`mb-4 p-3 rounded text-sm font-medium ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Título</label>
          <input
            className="block w-full border rounded-lg p-2 bg-gray-100"
            name="title"
            value={form.title}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Cliente</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            name="clientId"
            value={form.clientId || ''}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Descrição</label>
          <textarea
            className="block w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Status</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="open">Aberto</option>
            <option value="in_progress">Em andamento</option>
            <option value="closed">Fechado</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Prioridade</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Categoria</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="financeiro">Financeiro</option>
            <option value="suporte">Suporte</option>
            <option value="atendimento">Atendimento</option>
            <option value="infraestrutura">Infraestrutura</option>
            <option value="logistica">Logística</option>
            <option value="administrativo">Administrativo</option>
            <option value="comercial">Comercial</option>
            <option value="seguranca">Segurança</option>
            <option value="rh">RH</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">SLA</label>
          <input
            type="datetime-local"
            className="block w-full border rounded-lg p-2"
            name="sla"
            value={form.sla}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Responsável</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
          >
            <option value="">Nenhum</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Salvar Alterações
          </button>
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
            onClick={() => navigate(`/tickets/${id}`)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTicket;
