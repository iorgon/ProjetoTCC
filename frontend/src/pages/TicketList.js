import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TicketList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            status: appliedFilters.status || undefined,
            priority: appliedFilters.priority || undefined,
            category: appliedFilters.category || undefined,
            assignedTo: appliedFilters.assignedTo || undefined,
          },
        });
        setTickets(response.data);
      } catch (err) {
        console.error('Erro ao buscar tickets:', err);
        setError('Não foi possível carregar os tickets.');
      }
    };

    fetchTickets();
  }, [token, appliedFilters]);

  const handleDetails = (id) => {
    navigate(`/tickets/${id}`);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    const reset = { status: '', priority: '', category: '', assignedTo: '' };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  // Ordenação
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helpers
  const getSlaColor = (date) => {
    if (!date) return '';
    const deadline = new Date(date);
    const now = new Date();
    if (now > deadline) return 'text-red-600 font-bold'; // Vencido
    if ((deadline - now) / 1000 / 60 / 60 < 1) return 'text-yellow-600 font-bold'; // Menos de 1h
    return 'text-green-700';
  };

  // Pesquisa e ordenação local
  const filteredAndSortedTickets = tickets
    .filter(ticket =>
      (ticket.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (ticket.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (ticket.assignedTechnician?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (ticket.client?.name?.toLowerCase() || '').includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'assignedTechnician') {
        aValue = a.assignedTechnician?.name || '';
        bValue = b.assignedTechnician?.name || '';
      }
      if (sortConfig.key === 'client') {
        aValue = a.client?.name || '';
        bValue = b.client?.name || '';
      }
      if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const sortArrow = (col) =>
    sortConfig.key === col
      ? sortConfig.direction === 'asc'
        ? ' ▲'
        : ' ▼'
      : '';

  return (
    <div className="w-full max-w-full mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Lista de Tickets</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {/* Barra de pesquisa */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Pesquisar por título, cliente, categoria ou responsável..."
          className="border rounded-lg px-3 py-2 w-full sm:w-96"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            className="block w-full border rounded-lg p-2 bg-white"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em andamento</option>
            <option value="closed">Fechado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
          <select
            name="priority"
            className="block w-full border rounded-lg p-2 bg-white"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">Todas</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            name="category"
            className="block w-full border rounded-lg p-2 bg-white"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">Todas</option>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <select
            name="assignedTo"
            className="block w-full border rounded-lg p-2 bg-white"
            value={filters.assignedTo}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botões de filtro */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          onClick={applyFilters}
        >
          Aplicar Filtros
        </button>
        <button
          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
          onClick={resetFilters}
        >
          Limpar Filtros
        </button>
      </div>

      {/* Tabela */}
      {filteredAndSortedTickets.length === 0 ? (
        <p className="text-gray-500">Nenhum ticket encontrado com os filtros aplicados.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg shadow">
          <table className="min-w-[1200px] divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('id')}>
                  ID{sortArrow('id')}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('title')}>
                  Título{sortArrow('title')}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('client')}>
                  Cliente{sortArrow('client')}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('status')}>
                  Status{sortArrow('status')}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('priority')}>
                  Prioridade{sortArrow('priority')}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('category')}>
                  Categoria{sortArrow('category')}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('assignedTechnician')}>
                  Responsável{sortArrow('assignedTechnician')}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700 cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Criação{sortArrow('createdAt')}
                </th>
                {/* Novas colunas */}
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700">SLA Início</th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700">SLA Solução</th>
                <th className="px-4 py-2 text-left font-semibold text-sm text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{ticket.id}</td>
                  <td className="px-4 py-2">{ticket.title}</td>
                  <td className="px-4 py-2">{ticket.client?.name || '---'}</td>
                  <td className="px-4 py-2">{formatStatus(ticket.status)}</td>
                  <td className="px-4 py-2">{formatPriority(ticket.priority)}</td>
                  <td className="px-4 py-2">{capitalize(ticket.category)}</td>
                  <td className="px-4 py-2">{ticket.assignedTechnician?.name || '---'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleString('pt-BR')}</td>
                  {/* Novas colunas com destaque de cor */}
                  <td className={`px-4 py-2 whitespace-nowrap ${getSlaColor(ticket.slaStart)}`}>{ticket.slaStart ? new Date(ticket.slaStart).toLocaleString('pt-BR') : ''}</td>
                  <td className={`px-4 py-2 whitespace-nowrap ${getSlaColor(ticket.slaSolve)}`}>{ticket.slaSolve ? new Date(ticket.slaSolve).toLocaleString('pt-BR') : ''}</td>
                  <td className="px-4 py-2">
                    <button
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
                      onClick={() => handleDetails(ticket.id)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedTickets.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-gray-500 text-center py-6">Nenhum ticket encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helpers
const formatStatus = (status) => {
  switch (status) {
    case 'open': return 'Aberto';
    case 'in_progress': return 'Em andamento';
    case 'closed': return 'Fechado';
    default: return status;
  }
};

const formatPriority = (priority) => {
  switch (priority) {
    case 'low': return 'Baixa';
    case 'medium': return 'Média';
    case 'high': return 'Alta';
    default: return priority;
  }
};

const capitalize = (text) => text?.charAt(0) === undefined ? '' : text?.charAt(0).toUpperCase() + text?.slice(1);

export default TicketList;
