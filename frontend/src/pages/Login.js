import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth(); // Pega a função de login do contexto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o carregamento

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setError(''); // Limpa o erro anterior
    setIsLoading(true); // Inicia o carregamento

    try {
      await login(email, password); // Chama a função login do contexto
    } catch (err) {
      // Dependendo do erro, você pode ajustar as mensagens de erro
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false); // Desativa o carregamento após a requisição
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Login</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Senha</label>
          <input
            type="password"
            className="form-control"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading} // Desabilita o botão durante o carregamento
        >
          {isLoading ? 'Carregando...' : 'Entrar'} {/* Mostra 'Carregando...' enquanto o login é processado */}
        </button>
      </form>
    </div>
  );
};

export default Login;
