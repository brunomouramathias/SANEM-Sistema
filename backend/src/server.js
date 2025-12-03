const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const beneficiarioRoutes = require('./routes/beneficiario.routes');
const operadorRoutes = require('./routes/operador.routes');
const estoqueRoutes = require('./routes/estoque.routes');
const tipoRoutes = require('./routes/tipo.routes');
const doacaoRecebidaRoutes = require('./routes/doacaoRecebida.routes');
const doacaoEnviadaRoutes = require('./routes/doacaoEnviada.routes');
const relatorioRoutes = require('./routes/relatorio.routes');

const app = express();

// Middlewares
// Middlewares
app.use(cors({
  origin: '*', // Em produção, restrinja para o domínio do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Log de requisições para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/beneficiarios', beneficiarioRoutes);
app.use('/api/operadores', operadorRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/doacoes/recebidas', doacaoRecebidaRoutes);
app.use('/api/doacoes/enviadas', doacaoEnviadaRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API SANEM funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;

// Iniciar servidor
async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`API disponível em http://localhost:${PORT}/api`);
  });
}

startServer();

