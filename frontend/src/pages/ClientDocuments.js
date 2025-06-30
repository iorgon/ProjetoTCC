import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';

const ClientDocuments = () => {
  const { clientId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [client, setClient] = useState(null);

  useEffect(() => {
    fetchDocs();
    fetchClient();
    // eslint-disable-next-line
  }, [clientId]);

  const fetchDocs = async () => {
    const res = await api.get(`/clients/${clientId}/documents`);
    setDocuments(res.data);
  };

  const fetchClient = async () => {
    try {
      const res = await api.get(`/clients/${clientId}`);
      setClient(res.data);
    } catch {
      setClient(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Selecione um arquivo!');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    await api.post(`/clients/${clientId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setMessage('Arquivo enviado!');
    setFile(null);
    setDescription('');
    fetchDocs();
  };

  const handleDelete = async (id) => {
    if(window.confirm("Remover este documento?")) {
      await api.delete(`/client-documents/${id}`);
      fetchDocs();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/clients" className="text-blue-700 hover:underline">&larr; Voltar</Link>
        <h2 className="text-2xl font-bold">Documentação do Cliente</h2>
      </div>
      {client && (
        <div className="mb-4 p-3 bg-white rounded-xl shadow">
          <strong>Cliente:</strong> {client.name}
          {client.cnpj && <span className="ml-4"><strong>CNPJ:</strong> {client.cnpj}</span>}
        </div>
      )}
      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-2 mb-4 bg-white p-4 rounded-xl shadow">
        <input type="file" onChange={e => setFile(e.target.files[0])} className="block" />
        <input type="text" placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} className="border rounded-lg px-2 py-1 flex-1"/>
        <button className="bg-blue-700 text-white px-4 py-2 rounded-lg" type="submit">Enviar</button>
      </form>
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-3">Arquivos cadastrados</h3>
        <ul>
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center justify-between border-t py-2">
              <div>
                <a
                  href={`${process.env.REACT_APP_API_URL || ''}/api/client-documents/${doc.id}/download`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >{doc.filename}</a>
                {doc.description && <span className="ml-2 text-sm text-gray-600">({doc.description})</span>}
              </div>
              <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
            </li>
          ))}
          {documents.length === 0 && (
            <li className="text-gray-500 py-4">Nenhum documento cadastrado</li>
          )}
        </ul>
        {message && <div className="mt-2 text-green-700">{message}</div>}
      </div>
    </div>
  );
};

export default ClientDocuments;
