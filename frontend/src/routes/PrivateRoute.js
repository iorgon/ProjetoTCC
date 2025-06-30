import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Exibe mensagem de carregamento enquanto o contexto de autenticação é inicializado
  if (loading) {
    return <p>Carregando...</p>; // Pode ser substituído por um spinner de carregamento
  }

  // Verifica a presença do token no localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('Token ausente. Redirecionando para login.'); // Log para depuração
    return <Navigate to="/login" replace />; // Redireciona para a página de login
  }

  // Verifica se o usuário está autenticado no contexto
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
