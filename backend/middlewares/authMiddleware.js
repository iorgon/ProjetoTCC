const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // Recupera o cabeçalho Authorization
  console.log('Cabeçalho Authorization recebido:', authHeader); // Log para depuração do cabeçalho

  // Verifica se o cabeçalho Authorization está presente e no formato correto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Token ausente ou no formato inválido.'); // Log para identificar problemas no cabeçalho
    return res.status(401).json({ error: 'Token ausente ou no formato inválido.' });
  }

  // Extrai o token do cabeçalho Authorization
  const token = authHeader.split(' ')[1]; // Divide 'Bearer <token>' e obtém o token
  console.log('Token recebido:', token); // Log do token recebido

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta-chave');
    console.log('Token decodificado:', decoded); // Log dos dados decodificados do token

    req.user = decoded; // Adiciona os dados do usuário ao objeto da requisição
    console.log('Usuário autenticado:', req.user); // Log do usuário autenticado
    next(); // Continua para o próximo middleware ou rota
  } catch (error) {
    console.error('Erro ao validar token:', error.message); // Log do erro ao validar o token

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    // Retorna erro genérico para outros casos não previstos
    return res.status(500).json({ error: 'Erro ao processar o token.' });
  }
};

module.exports = authMiddleware;
