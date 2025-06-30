import React, { useState } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";

const endpoints = [
  { key: "by-client", label: "Tickets por Cliente", url: "/tickets/reports/by-client" },
  { key: "by-technician", label: "Tickets por Técnico", url: "/tickets/reports/by-technician" },
  { key: "sla-expired", label: "Tickets com SLA Vencido", url: "/tickets/reports/sla-expired" },
  { key: "average-resolution", label: "Tempo Médio de Resolução por Técnico", url: "/tickets/reports/average-resolution" },
  { key: "active-by-technician", label: "Técnicos com mais tickets abertos", url: "/tickets/reports/active-by-technician" },
  { key: "closed-by-month-technician", label: "Tickets fechados no mês por técnico", url: "/tickets/reports/closed-by-month-technician" },
];

const COLUMN_LABELS = {
  'client.id': 'ID do Cliente',
  'client.name': 'Cliente',
  'client.cnpj': 'CNPJ',
  'client.email': 'E-mail do Cliente',
  'client.phone': 'Telefone do Cliente',
  clientId: 'ID do Cliente',
  'assignedTechnician.id': 'ID do Técnico',
  'assignedTechnician.name': 'Técnico',
  'assignedTechnician.email': 'E-mail do Técnico',
  assignedTo: 'ID do Técnico',
  totalTickets: 'Total de Tickets',
  openTickets: "Tickets Abertos",
  closedTickets: "Tickets Fechados no Mês",
  avgTime: 'Tempo Médio (min)',
  sla: 'SLA',
  status: 'Status',
  category: 'Categoria',
  priority: 'Prioridade',
  title: 'Título',
  name: 'Nome',
  email: 'E-mail',
  id: 'ID',
  year: "Ano",
  month: "Mês",
};

const DISPLAY_COLUMNS = {
  "by-client": [
    "client.name",
    "client.cnpj",
    "client.email",
    "client.phone",
    "totalTickets",
  ],
  "by-technician": [
    "assignedTechnician.name",
    "assignedTechnician.email",
    "totalTickets",
  ],
  "sla-expired": [
    "id",
    "client.name",
    "sla",
    "title",
    "status",
  ],
  "average-resolution": [
    "assignedTechnician.name",
    "assignedTechnician.email",
    "avgTime",
  ],
  "active-by-technician": [
    "assignedTechnician.name",
    "assignedTechnician.email",
    "openTickets",
  ],
  "closed-by-month-technician": [
    "year",
    "month",
    "assignedTechnician.name",
    "assignedTechnician.email",
    "closedTickets",
  ],
};

function flatten(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flatten(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

export default function TicketReports() {
  const [selectedReport, setSelectedReport] = useState(endpoints[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.get(selectedReport.url);
      setData(res.data);
      if (res.data.length === 0) setMsg("Nenhum resultado encontrado.");
    } catch {
      setMsg("Erro ao buscar relatório.");
    }
    setLoading(false);
  };

  // Exportação: apenas colunas visíveis e títulos traduzidos
  const exportToExcel = () => {
    if (!data.length) return;
    const flatData = data.map(flatten);
    const columns = DISPLAY_COLUMNS[selectedReport.key] || Object.keys(flatData[0] || {});

    const sheetData = [
      columns.map(col => COLUMN_LABELS[col] || col), // Cabeçalho
      ...flatData.map(row => columns.map(col => row[col])),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedReport.label);
    XLSX.writeFile(wb, `${selectedReport.label.replace(/ /g, "_")}.xlsx`);
  };

  function renderTable() {
    if (!data.length) return null;
    const flatData = data.map(flatten);
    const columns = DISPLAY_COLUMNS[selectedReport.key] || Object.keys(flatData[0] || {});
    return (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} className="px-3 py-2 border-b text-left text-xs font-bold text-gray-700">
                  {COLUMN_LABELS[col] || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flatData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col} className="px-3 py-2 text-sm">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Relatórios de Tickets</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        {endpoints.map(r => (
          <button
            key={r.key}
            className={`px-4 py-2 rounded-lg font-semibold transition 
            ${selectedReport.key === r.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => { setSelectedReport(r); setData([]); setMsg(""); }}
          >
            {r.label}
          </button>
        ))}
      </div>
      <button
        className="px-4 py-2 mb-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
        onClick={fetchData}
        disabled={loading}
      >
        {loading ? "Carregando..." : "Buscar"}
      </button>
      <button
        className="px-4 py-2 mb-4 ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
        onClick={exportToExcel}
        disabled={!data.length}
      >
        Exportar para Excel
      </button>
      {msg && <div className="mb-4 text-red-600">{msg}</div>}
      {renderTable()}
    </div>
  );
}
