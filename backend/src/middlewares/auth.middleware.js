const jwt = require('jsonwebtoken');
require('dotenv').config();

// FIX: Usando chave fixa para garantir consistência
const JWT_SECRET = 'sanem_sistema_seguro_2024_key_fixa_v2';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    return next();
  } catch (error) {
    console.error('Erro de Autenticação:', error.message);
    console.error('Token recebido (inicio):', token.substring(0, 10) + '...');
    console.error('Segredo usado (inicio):', JWT_SECRET.substring(0, 3) + '...');
    return res.status(401).json({ error: 'Token inválido', details: error.message });
  }
}

module.exports = authMiddleware;

