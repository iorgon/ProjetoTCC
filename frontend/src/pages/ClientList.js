import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    notes: '',
    plan: 'basic', // campo novo: valor padrão
  });
  const [message, setMessage] = useState('');
  const [editClient, setEditClient] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (error) {
      setMessage('Erro ao carregar clientes');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditClient({ ...editClient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', form);
      setMessage('Cliente cadastrado com sucesso!');
      setForm({ name: '', cnpj: '', email: '', phone: '', notes: '', plan: 'basic' });
      fetchClients();
      setShowForm(false);
    } catch (error) {
      setMessage('Erro ao cadastrar cliente');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clients/${editClient.id}`, editClient);
      setMessage('Cliente atualizado!');
      setEditClient(null);
      fetchClients();
    } catch {
      setMessage('Erro ao atualizar cliente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este cliente?")) {
      try {
        await api.delete(`/clients/${id}`);
        setMessage('Cliente removido com sucesso!');
        fetchClients();
      } catch {
        setMessage('Erro ao excluir cliente.');
      }
    }
  };

  // Ordenação
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pesquisa e ordenação local
  const filteredAndSortedClients = clients
    .filter(client =>
      (client.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (client.cnpj?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (client.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (client.phone?.toLowerCase() || '').includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fechar' : 'Novo Cliente'}
        </button>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Pesquisar por nome, CNPJ, e-mail ou telefone..."
          className="border rounded-lg px-3 py-2 w-full sm:w-96"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {message && <div className="mb-4 p-3 rounded bg-gray-100 text-gray-800">{message}</div>}

      {/* Formulário de Edição */}
      {editClient && (
        <form onSubmit={handleEditSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl p-6 shadow">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nome</label>
            <input name="name" value={editClient.name} onChange={handleEditChange} required className="block w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">CNPJ</label>
            <input name="cnpj" value={editClient.cnpj || ''} onChange={handleEditChange} className="block w-full border rounded-lg p-2 whitespace-nowrap" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">E-mail</label>
            <input name="email" value={editClient.email || ''} onChange={handleEditChange} className="block w-full border rounded-lg p-2 whitespace-nowrap" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Telefone</label>
            <input name="phone" value={editClient.phone || ''} onChange={handleEditChange} className="block w-full border rounded-lg p-2 whitespace-nowrap" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Plano (SLA)</label>
            <select name="plan" value={editClient.plan || 'basic'} onChange={handleEditChange} className="block w-full border rounded-lg p-2">
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Observações</label>
            <textarea name="notes" value={editClient.notes || ""} onChange={handleEditChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg" type="submit">Salvar</button>
            <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg" type="button" onClick={() => setEditClient(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Formulário de Cadastro */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl p-6 shadow">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nome</label>
            <input name="name" value={form.name} onChange={handleChange} required className="block w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">CNPJ</label>
            <input name="cnpj" value={form.cnpj} onChange={handleChange} className="block w-full border rounded-lg p-2 whitespace-nowrap" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">E-mail</label>
            <input name="email" value={form.email} onChange={handleChange} className="block w-full border rounded-lg p-2 whitespace-nowrap" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Telefone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="block w-full border rounded-lg p-2 whitespace-nowrap" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Plano (SLA)</label>
            <select name="plan" value={form.plan} onChange={handleChange} className="block w-full border rounded-lg p-2">
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Observações</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg" type="submit">Salvar</button>
          </div>
        </form>
      )}

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-xl shadow p-4 w-full overflow-x-auto">
        <table className="min-w-[900px]">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                Nome{sortArrow('name')}
              </th>
              <th className="px-2 py-2 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('cnpj')}>
                CNPJ{sortArrow('cnpj')}
              </th>
              <th className="px-2 py-2 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('email')}>
                E-mail{sortArrow('email')}
              </th>
              <th className="px-2 py-2 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('phone')}>
                Telefone{sortArrow('phone')}
              </th>
              <th className="px-2 py-2 text-left">Plano (SLA)</th>
              <th className="px-2 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClients.map(client => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-2">{client.name}</td>
                <td className="px-2 py-2 whitespace-nowrap">{client.cnpj}</td>
                <td className="px-2 py-2 whitespace-nowrap">{client.email}</td>
                <td className="px-2 py-2 whitespace-nowrap">{client.phone}</td>
                <td className="px-2 py-2">{client.plan === 'premium' ? 'Premium' : 'Básico'}</td>
                <td className="px-2 py-2 flex gap-2">
                  <a href={`/clients/${client.id}/inventory`} className="text-blue-600 hover:underline">Inventário</a>
                  <a href={`/clients/${client.id}/documents`} className="text-blue-600 hover:underline">Documentação</a>
                  <button onClick={() => setEditClient(client)} className="text-yellow-600 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {filteredAndSortedClients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-gray-500 text-center py-6">Nenhum cliente encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
