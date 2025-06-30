import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const priorities = [
  { key: 'low', label: 'Baixa' },
  { key: 'medium', label: 'Média' },
  { key: 'high', label: 'Alta' },
];

const plans = [
  { key: 'basic', label: 'Básico' },
  { key: 'premium', label: 'Premium' },
];

export default function SLAConfig() {
  const { user, token } = useAuth();
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    api.get('/sla-config', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSlas(res.data))
      .finally(() => setLoading(false));
  }, [user, token]);

  const handleChange = (plan, priority, field, value) => {
    setSlas(prev =>
      prev.map(sla =>
        sla.plan === plan && sla.priority === priority
          ? { ...sla, [field]: value }
          : sla
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      // O array slas deve conter os campos plan, priority, startHours, solveHours
      await api.put('/sla-config', slas, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('SLA atualizado com sucesso!');
    } catch (err) {
      setMsg('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="max-w-2xl mx-auto p-8 text-red-700">Acesso restrito a administradores.</div>;
  }
  if (loading) return <div className="max-w-2xl mx-auto p-8">Carregando...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Configuração de SLA</h2>
      <p className="mb-4 text-gray-600">
        Defina o prazo máximo (<b>em horas</b>) para cada prioridade e plano.<br />
        <span className="text-xs text-gray-500">Você pode editar o prazo de início (primeira resposta) e o prazo de solução separadamente.</span>
      </p>
      <table className="min-w-full mb-6">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Prioridade</th>
            {plans.map(plan => (
              <th key={plan.key} className="py-2 px-4 text-left">{plan.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {priorities.map(priority => (
            <tr key={priority.key}>
              <td className="py-2 px-4 font-semibold">{priority.label}</td>
              {plans.map(plan => {
                const sla = slas.find(s => s.plan === plan.key && s.priority === priority.key) || {};
                return (
                  <td key={plan.key} className="py-2 px-4">
                    <div className="flex gap-2 items-center">
                      <div>
                        <input
                          type="number"
                          min={1}
                          className="border rounded px-2 py-1 w-16"
                          value={sla.startHours || ''}
                          onChange={e => handleChange(plan.key, priority.key, 'startHours', e.target.value)}
                        />{' '}
                        <span className="text-xs text-gray-500">Início</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          min={1}
                          className="border rounded px-2 py-1 w-16"
                          value={sla.solveHours || ''}
                          onChange={e => handleChange(plan.key, priority.key, 'solveHours', e.target.value)}
                        />{' '}
                        <span className="text-xs text-gray-500">Solução</span>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
      {msg && <div className="mt-4">{msg}</div>}
    </div>
  );
}
