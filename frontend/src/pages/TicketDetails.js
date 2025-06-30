import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    FaPlay, FaEdit, FaTimes, FaPaperclip, FaHourglassHalf, FaInfoCircle, FaExclamationTriangle,
    FaFolder, FaUserCog, FaUser, FaCalendarAlt, FaClock, FaHistory, FaBuilding, FaEnvelope, FaPhone
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('comentarios');

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const { data } = await api.get(`/tickets/${id}`);
                setTicket(data);
                setComments(data.comments || []);
            } catch (error) {
                console.error('Erro ao buscar ticket:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    const formatDate = (iso) => iso ? new Date(iso).toLocaleString('pt-BR') : '';
    const capitalize = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);
    const formatStatus = (status) => {
        const map = {
            open: { label: 'Aberto', icon: '🔓' },
            in_progress: { label: 'Em andamento', icon: '⏳' },
            closed: { label: 'Fechado', icon: '🔒' },
        };
        return map[status] || { label: status, icon: '' };
    };
    const formatPriority = (priority) => ({ low: 'Baixa', medium: 'Média', high: 'Alta' }[priority] || priority);

    // === SLA helpers ===

    // Retorna {statusColor, textExtra}
    const slaStatusInfo = (date) => {
        if (!date) return { color: '', info: '' };
        const deadline = new Date(date);
        const now = new Date();
        const diffMs = deadline - now;
        const absDiffMs = Math.abs(diffMs);

        // Calcula horas e minutos
        const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
        const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

        let info = '';
        let color = '';

        if (now > deadline) {
            // SLA VENCIDO
            color = 'text-red-600 font-bold';
            info = `Vencido há ${hours ? `${hours}h ` : ''}${minutes}min`;
        } else if (diffMs < 1000 * 60 * 60) {
            // Menos de 1h
            color = 'text-yellow-600 font-bold';
            info = `Faltam ${hours ? `${hours}h ` : ''}${minutes}min`;
        } else {
            // Ok
            color = 'text-green-700';
            info = `Faltam ${hours ? `${hours}h ` : ''}${minutes}min`;
        }
        return { color, info };
    };

    const handleStart = async () => {
        try {
            await api.put(`/tickets/${id}`, { status: 'in_progress' });
            setTicket({ ...ticket, status: 'in_progress' });
        } catch (error) {
            alert('Erro ao iniciar atendimento.');
        }
    };

    const handleFileUpload = async () => {
        if (!file) return alert('Selecione um arquivo.');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await api.post(`/tickets/${id}/attachments`, formData);
            setTicket(prevTicket => ({
                ...prevTicket,
                attachments: [...(prevTicket.attachments || []), data]
            }));
            alert('Arquivo enviado com sucesso!');
            setFile(null);
        } catch (error) {
            alert('Erro ao enviar arquivo.');
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return alert('Comentário não pode ser vazio.');
        try {
            const { data } = await api.post(`/tickets/${id}/comments`, { message: newComment });
            setComments([...comments, data]);
            setNewComment('');
        } catch (error) {
            alert('Erro ao adicionar comentário.');
        }
    };

    if (loading) return <div className="p-5">Carregando detalhes...</div>;
    if (!ticket) return <div className="p-5">Ticket não encontrado.</div>;

    const status = formatStatus(ticket.status);

    // Detalhes completos do cliente, se existirem
    const client = ticket.client || {};

    // NOVOS CAMPOS SLA
    const slaStartStatus = slaStatusInfo(ticket.slaStart);
    const slaSolveStatus = slaStatusInfo(ticket.slaSolve);

    const ticketDetails = [
        { label: 'Cliente', value: client.name || '---', icon: <FaUser className="text-blue-500" /> },
        { label: 'CNPJ', value: client.cnpj || '---', icon: <FaBuilding className="text-gray-500" /> },
        { label: 'E-mail', value: client.email || '---', icon: <FaEnvelope className="text-gray-500" /> },
        { label: 'Telefone', value: client.phone || '---', icon: <FaPhone className="text-gray-500" /> },
        { label: 'Status', value: status.label, icon: <FaHourglassHalf className="text-orange-500"/> },
        { label: 'Prioridade', value: formatPriority(ticket.priority), icon: <FaExclamationTriangle className="text-red-500"/> },
        { label: 'Categoria', value: capitalize(ticket.category), icon: <FaFolder className="text-blue-500"/> },
        { label: 'Responsável', value: ticket.assignedTechnician?.name || 'Nenhum', icon: <FaUserCog className="text-gray-500"/> },
        { label: 'Criado por', value: `${ticket.creator?.name} (${ticket.creator?.email})`, icon: <FaUser className="text-gray-500"/> },
        { label: 'Data de criação', value: formatDate(ticket.createdAt), icon: <FaCalendarAlt className="text-gray-500"/> },
        {
            label: 'SLA de Início',
            value: ticket.slaStart ? formatDate(ticket.slaStart) : 'Não definido',
            icon: <FaClock className="text-orange-500"/>,
            color: slaStartStatus.color,
            info: slaStartStatus.info,
        },
        {
            label: 'SLA de Solução',
            value: ticket.slaSolve ? formatDate(ticket.slaSolve) : 'Não definido',
            icon: <FaClock className="text-red-500"/>,
            color: slaSolveStatus.color,
            info: slaSolveStatus.info,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 mt-6 flex flex-col md:flex-row gap-6">
            {/* Coluna Principal */}
            <div className="md:w-2/3 bg-white shadow-md rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                        #{ticket.id} - {ticket.title}
                    </h2>
                    <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{status.icon} {status.label}</span>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition disabled:bg-gray-300 disabled:cursor-not-allowed" onClick={handleStart} disabled={ticket.status !== 'open'}><FaPlay /> Iniciar</button>
                    <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-semibold flex items-center gap-2 transition" onClick={() => navigate(`/tickets/${ticket.id}/edit`)}><FaEdit /> Editar</button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition" onClick={() => api.put(`/tickets/${id}`, { status: 'closed' }).then(() => navigate(0))}><FaTimes /> Fechar</button>
                </div>
                <div className="border-b mb-4 flex flex-wrap gap-4">
                    <button onClick={() => setActiveTab('comentarios')} className={`transition-all duration-200 pb-2 ${activeTab === 'comentarios' ? 'border-b-2 border-blue-500 font-medium text-blue-700' : 'text-gray-500'}`}>Comentários</button>
                    <button onClick={() => setActiveTab('anexos')} className={`transition-all duration-200 pb-2 ${activeTab === 'anexos' ? 'border-b-2 border-blue-500 font-medium text-blue-700' : 'text-gray-500'}`}>Anexos</button>
                    <button onClick={() => setActiveTab('historico')} className={`transition-all duration-200 pb-2 ${activeTab === 'historico' ? 'border-b-2 border-blue-500 font-medium text-blue-700' : 'text-gray-500'}`}>Histórico</button>
                </div>
                {/* Conteúdo das Abas */}
                {activeTab === 'comentarios' && (
                    <div>
                        {comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.map(c => {
                                    const isSystem = c.author?.name === 'Sistema';
                                    const isInternal = c.author?.role === 'technician';
                                    const bg = isSystem ? 'bg-red-100 border-red-300' : isInternal ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200';
                                    return (
                                        <div key={c.id} className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold flex-shrink-0">
                                                {c.author?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className={`flex-1 p-3 rounded-xl border ${bg}`}>
                                                <p className="text-sm text-gray-800"><strong>{c.author?.name || 'Usuário'}</strong></p>
                                                <p className="text-sm text-gray-700 whitespace-pre-line my-1">{c.message}</p>
                                                <small className="text-gray-500">{formatDate(c.createdAt)}</small>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p className="text-sm text-gray-500">Nenhum comentário ainda.</p>}
                        <textarea className="mt-4 w-full border rounded-lg p-2" rows="3" placeholder="Adicionar comentário..." value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition" onClick={addComment}>Adicionar</button>
                        </div>
                    </div>
                )}
                {activeTab === 'anexos' && (
                     <div className="space-y-3">
                        {ticket.attachments?.length > 0 ? (
                            ticket.attachments.map(att => (
                                <div key={att.id} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                    <FaPaperclip className="text-xl text-gray-500" />
                                    <div className="flex-1">
                                        <a href={`/uploads/${att.path}`} className="font-medium text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                            {att.filename}
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-500">Nenhum anexo.</p>}
                        <div className="flex gap-2 mt-4 border-t pt-4">
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition" onClick={handleFileUpload}>Enviar</button>
                        </div>
                    </div>
                )}
                {activeTab === 'historico' && (
                    <div className="space-y-3">
                        {ticket.logs?.length > 0 ? (
                            ticket.logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                    <FaHistory className="text-xl text-gray-500 mt-1" />
                                    <div className="flex-1 text-sm">
                                        <p className="text-gray-800">{log.message}</p>
                                        <small className="text-gray-500">Por: {log.user?.name || 'Sistema'} em {formatDate(log.createdAt)}</small>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-500">Nenhuma alteração registrada.</p>}
                    </div>
                )}
            </div>
            {/* Coluna Detalhes */}
            <div className="w-full md:w-1/3 bg-white shadow-md rounded-2xl p-6 h-fit">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Descrição</h3>
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-6">
                    <FaInfoCircle className="text-xl text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-800 whitespace-pre-line">{ticket.description}</p>
                </div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Detalhes do Ticket</h3>
                <div className="space-y-2 text-sm">
                    {ticketDetails.map(detail => (
                        <div key={detail.label} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                           <div className="w-5 text-center">{detail.icon}</div>
                           <div>
                                <strong className="text-gray-600">{detail.label}:</strong>
                                <span className={`text-gray-800 ml-1 ${
                                    detail.color || ''
                                }`}>
                                  {detail.value}
                                  {detail.label.includes('SLA') && detail.value !== 'Não definido' && (
                                    <span className="ml-2 text-xs">{detail.info}</span>
                                  )}
                                </span>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
