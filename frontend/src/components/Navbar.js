import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 shadow text-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-bold text-xl flex items-center gap-2 hover:text-blue-200 transition">
            🎟️ MonDesk
          </Link>
          <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
          <Link to="/tickets" className="hover:text-blue-200 transition">Tickets</Link>
          <Link to="/create-ticket" className="hover:text-blue-200 transition">Criar Ticket</Link>
          <Link to="/clients" className="hover:text-blue-200 transition">Clientes</Link>
          <Link to="/reports" className="hover:text-blue-200 transition">Relatórios</Link>
          {user?.role === 'admin' && (
            <Link to="/sla-config" className="hover:text-blue-200 transition">Configurar SLA</Link>
          )}

        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-white hidden sm:block">Olá, <span className="font-bold">{user.name}</span></span>
            <button
              className="px-3 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold transition text-sm"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
