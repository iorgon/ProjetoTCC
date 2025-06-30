import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const InventoryList = () => {
  const { clientId } = useParams();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: '',
    serialNumber: '',
    acquisitionDate: '',
    status: '',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [client, setClient] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // Novos estados para busca e ordenação
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchClient();
    fetchInventory();
    // eslint-disable-next-line
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const res = await api.get(`/clients/${clientId}`);
      setClient(res.data);
    } catch {
      setClient(null);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await api.get(`/clients/${clientId}/inventory`);
      setItems(res.data);
    } catch {
      setItems([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clients/${clientId}/inventory`, form);
      setMessage('Item cadastrado com sucesso!');
      setForm({ name: '', type: '', serialNumber: '', acquisitionDate: '', status: '', notes: '' });
      setShowForm(false);
      fetchInventory();
    } catch (error) {
      setMessage('Erro ao cadastrar item');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/inventory/${editItem.id}`, editItem);
      setMessage('Item atualizado!');
      setEditItem(null);
      fetchInventory();
    } catch {
      setMessage('Erro ao atualizar item.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Excluir item?")) {
      try {
        await api.delete(`/inventory/${id}`);
        setMessage('Item removido com sucesso!');
        fetchInventory();
      } catch {
        setMessage('Erro ao excluir item.');
      }
    }
  };

  // Função para ordenação ao clicar no cabeçalho
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Aplica busca e ordenação localmente
  const filteredAndSortedItems = items
    .filter(item =>
      (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.type?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.serialNumber?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.status?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.notes?.toLowerCase() || '').includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';
      if (sortConfig.key === 'acquisitionDate') {
        aValue = aValue || '';
        bValue = bValue || '';
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Ícone de seta para ordenar
  const sortArrow = (col) =>
    sortConfig.key === col
      ? sortConfig.direction === 'asc'
        ? ' ▲'
        : ' ▼'
      : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Inventário {client && <span className="text-blue-700">({client.name})</span>}
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fechar' : 'Novo Item'}
        </button>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Pesquisar por nome, tipo, série, status..."
          className="border rounded-lg px-3 py-2 w-full sm:w-96"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {message && <div className="mb-4 p-3 rounded bg-gray-100 text-gray-800">{message}</div>}

      {/* Formulário de Edição */}
      {editItem && (
        <form
          onSubmit={handleEditSubmit}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl p-6 shadow"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nome</label>
            <input name="name" value={editItem.name} onChange={handleEditChange} required className="block w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tipo</label>
            <input name="type" value={editItem.type} onChange={handleEditChange} required className="block w-full border rounded-lg p-2" placeholder="Notebook, Roteador, etc" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nº Série</label>
            <input name="serialNumber" value={editItem.serialNumber || ""} onChange={handleEditChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Data Aquisição</label>
            <input name="acquisitionDate" type="date" value={editItem.acquisitionDate ? editItem.acquisitionDate.slice(0, 10) : ""} onChange={handleEditChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Status</label>
            <input name="status" value={editItem.status || ""} onChange={handleEditChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Observações</label>
            <textarea name="notes" value={editItem.notes || ""} onChange={handleEditChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg" type="submit">Salvar</button>
            <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg" type="button" onClick={() => setEditItem(null)}>Cancelar</button>
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
            <label className="block text-gray-700 font-medium mb-1">Tipo</label>
            <input name="type" value={form.type} onChange={handleChange} required className="block w-full border rounded-lg p-2" placeholder="Notebook, Roteador, etc" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nº Série</label>
            <input name="serialNumber" value={form.serialNumber} onChange={handleChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Data Aquisição</label>
            <input name="acquisitionDate" type="date" value={form.acquisitionDate} onChange={handleChange} className="block w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Status</label>
            <input name="status" value={form.status} onChange={handleChange} className="block w-full border rounded-lg p-2" placeholder="Ativo, Manutenção..." />
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

      {/* Tabela de Inventário */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                Nome{sortArrow('name')}
              </th>
              <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('type')}>
                Tipo{sortArrow('type')}
              </th>
              <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('serialNumber')}>
                Nº Série{sortArrow('serialNumber')}
              </th>
              <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('acquisitionDate')}>
                Data Aquisição{sortArrow('acquisitionDate')}
              </th>
              <th className="px-2 py-2 text-left cursor-pointer" onClick={() => handleSort('status')}>
                Status{sortArrow('status')}
              </th>
              <th className="px-2 py-2 text-left">Observações</th>
              <th className="px-2 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.map(item => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-2">{item.name}</td>
                <td className="px-2 py-2">{item.type}</td>
                <td className="px-2 py-2">{item.serialNumber}</td>
                <td className="px-2 py-2">{item.acquisitionDate?.slice(0, 10)}</td>
                <td className="px-2 py-2">{item.status}</td>
                <td className="px-2 py-2">{item.notes}</td>
                <td className="px-2 py-2 flex gap-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="text-yellow-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {filteredAndSortedItems.length === 0 && (
              <tr>
                <td colSpan={7} className="text-gray-500 text-center py-6">Nenhum item encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
