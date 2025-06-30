import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Certifique-se de configurar o Axios em services/api.js

const AuthContext = createContext();

// Função para verificar se o localStorage está acessível
const isStorageAccessible = () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Adicionado para armazenar o token no estado
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Recupera informações do localStorage ao carregar o componente
  useEffect(() => {
    const storedUser = isStorageAccessible() ? localStorage.getItem('user') : null;
    const storedToken = isStorageAccessible() ? localStorage.getItem('token') : null;

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken); // Armazena o token no estado do contexto
      api.defaults.headers.Authorization = `Bearer ${storedToken}`; // Configura o token no cabeçalho do Axios
      console.log('Token carregado do localStorage:', storedToken); // Log para verificar o token
    }
    setLoading(false);
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (isStorageAccessible()) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setToken(token); // Atualiza o estado com o novo token
      setUser(user);

      console.log('Token armazenado após login:', token); // Log para verificar o token após login
      navigate('/dashboard'); // Redireciona para o dashboard após login
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw new Error('Falha no login');
    }
  };

  // Função de logout
  const logout = () => {
    if (isStorageAccessible()) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUser(null);
    setToken(null); // Limpa o token do estado
    api.defaults.headers.Authorization = null;
    console.log('Logout realizado. Token removido.'); // Log para verificar o logout
    navigate('/login'); // Redireciona para a página de login
  };

  // Verifica se o usuário está autenticado
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
