import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CreateTicket = () => {
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [category, setCategory] = useState('suporte');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [message, setMessage] = useState('');
  const [errorDetail, setErrorDetail] = useState(null);
  const [slaConfig, setSlaConfig] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const technicians = response.data.filter(user => user.role === 'technician');
        setUsers(technicians);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        setClients(response.data);
      } catch (error) {
        // silencioso
      }
    };

    fetchUsers();
    fetchClients();
  }, [token]);

 // Buscar plano e SLAConfig sempre que cliente ou prioridade mudarem
  useEffect(() => {
    const fetchSLAConfig = async () => {
      if (!clientId || !priority) {
        setSlaConfig(null);
        return;
      }

      try {
        // 1. Descobrir o plano do cliente
        const clientRes = await api.get(`/clients/${clientId}`);
        const plan = clientRes.data.plan;

        // 2. Buscar a config do SLA no backend
        const slaRes = await api.get(`/sla-config`, {
          params: { plan, priority }
        });
        setSlaConfig(slaRes.data);
      } catch (error) {
        setSlaConfig(null);
        // opcional: tratar erro
      }
    };

    fetchSLAConfig();
  }, [clientId, priority]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!slaConfig) {
      setMessage('Não foi possível obter a configuração de SLA.');
      return;
    }

    const now = new Date();
    const slaStart = new Date(now.getTime() + Number(slaConfig.startHours) * 60 * 60 * 1000);
    const slaSolve = new Date(now.getTime() + Number(slaConfig.solveHours) * 60 * 60 * 1000);

    const payload = {
      title,
      description,
      priority,
      category,
      assignedTo: assignedTo ? parseInt(assignedTo, 10) : null,
      clientId: clientId ? parseInt(clientId, 10) : null,
      slaStart: slaStart.toISOString(),
      slaSolve: slaSolve.toISOString(),
    };

    setMessage('');
    setErrorDetail(null);

    try {
      console.log("Enviando payload:", payload);
      await api.post('/tickets', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Ticket criado com sucesso! SLA buscado do banco.');
      setTitle('');
      setDescription('');
      setPriority('low');
      setCategory('suporte');
      setAssignedTo('');
      setClientId('');
      setSlaConfig(null);
    } catch (error) {
      let errorMsg = 'Erro ao criar ticket.';
      let detail = '';
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMsg += ` ${error.response.data.error}`;
        }
        if (error.response.data && error.response.data.details) {
          if (typeof error.response.data.details === 'string') {
            detail = error.response.data.details;
          } else {
            detail = JSON.stringify(error.response.data.details, null, 2);
          }
        }
        if (error.response.status) {
          errorMsg += ` (HTTP ${error.response.status})`;
        }
      } else if (error.message) {
        detail = error.message;
      } else {
        detail = 'Erro desconhecido.';
      }
      setMessage(errorMsg);
      setErrorDetail(detail);
      console.error('Erro ao criar ticket:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Criar Ticket</h2>
      {message && (
        <div className={`mb-2 p-3 rounded text-sm font-medium ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      {errorDetail && (
        <div className="mb-4 p-3 rounded text-xs bg-red-200 text-red-800 font-mono whitespace-pre-line">
          {errorDetail}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Título</label>
          <input
            type="text"
            className="block w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        {/* Cliente */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Cliente</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
          >
            <option value="">Selecione o cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        {/* Descrição */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Descrição</label>
          <textarea
            className="block w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        {/* Prioridade */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Prioridade</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        {/* Categoria */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Categoria</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
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
        {/* Técnico Responsável */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Atribuir a</label>
          <select
            className="block w-full border rounded-lg p-2 bg-white"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Selecione um técnico</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Criar Ticket
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;
