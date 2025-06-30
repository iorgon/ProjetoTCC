import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/tickets/metrics/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(res.data);
      } catch (err) {
        setError('Erro ao carregar métricas.');
      }
    };

    fetchMetrics();
  }, [token]);

  if (error) return <div className="max-w-4xl mx-auto p-8">{error}</div>;
  if (!metrics) return <div className="max-w-4xl mx-auto p-8">Carregando métricas...</div>;

  const pieData = {
    labels: ['Baixa', 'Média', 'Alta'],
    datasets: [
      {
        data: [
          metrics.priorities.low,
          metrics.priorities.medium,
          metrics.priorities.high,
        ],
        backgroundColor: ['#38bdf8', '#facc15', '#ef4444'],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Abertos', 'Fechados', 'Em Andamento', 'SLA Vencido'],
    datasets: [
      {
        label: 'Tickets',
        data: [
          metrics.open,
          metrics.closed,
          metrics.inProgress,
          metrics.slaExpired
        ],
        backgroundColor: ['#2563eb', '#22c55e', '#fb923c', '#ef4444'],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8">Dashboard de Tickets</h2>

      {/* Métricas cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Abertos" value={metrics.open} color="bg-blue-600" />
        <MetricCard title="Fechados" value={metrics.closed} color="bg-green-600" />
        <MetricCard title="Em Andamento" value={metrics.inProgress} color="bg-orange-500" />
        <MetricCard title="SLA Vencido" value={metrics.slaExpired} color="bg-red-600" />
        <MetricCard title="Total" value={metrics.total} color="bg-slate-700" />
        <MetricCard title="Tempo Médio de Resolução (min)" value={metrics.avgResolution} color="bg-indigo-600" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex flex-col">
          <h5 className="text-center font-semibold mb-4">Distribuição por Prioridade</h5>
          <Pie data={pieData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex flex-col">
          <h5 className="text-center font-semibold mb-4">Status dos Tickets</h5>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color }) => (
  <div className={`rounded-xl shadow flex flex-col items-center justify-center py-8 ${color} text-white`}>
    <h5 className="text-lg font-bold">{title}</h5>
    <p className="text-3xl font-semibold mt-2">{value}</p>
  </div>
);

export default Dashboard;
