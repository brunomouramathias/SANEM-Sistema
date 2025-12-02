const jwt = require('jsonwebtoken');
const OperadorModel = require('../models/operador.model');
const { pool } = require('../config/database');
require('dotenv').config();

// FIX: Usando chave fixa para garantir consistência entre login e middleware
const JWT_SECRET = 'sanem_sistema_seguro_2024_key_fixa_v2';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const operador = await OperadorModel.findByEmail(email);

      if (!operador) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const senhaValida = await OperadorModel.verifyPassword(senha, operador.senha);

      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Registrar login
      await pool.query(
        'INSERT INTO Login_Logout (LG_Operador, LG_Data, LG_Modo) VALUES (?, NOW(), 1)',
        [operador.id]
      );

      const token = jwt.sign(
        { id: operador.id, email: operador.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        user: {
          id: operador.id,
          nome: operador.nome,
          email: operador.email,
          tipo: operador.tipo
        },
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      // Registrar logout
      await pool.query(
        'INSERT INTO Login_Logout (LG_Operador, LG_Data, LG_Modo) VALUES (?, NOW(), 0)',
        [req.userId]
      );

      return res.json({ success: true, message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Verificar token
  static async verify(req, res) {
    try {
      const operador = await OperadorModel.findById(req.userId);

      if (!operador) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      return res.json({
        valid: true,
        user: operador
      });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Registrar novo operador
  static async register(req, res) {
    try {
      const { nome, documento, email, senha, tipo } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      // Verificar se email já existe
      const existente = await OperadorModel.findByEmail(email);
      if (existente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const novoOperador = await OperadorModel.create({ nome, documento, email, senha, tipo });

      return res.status(201).json({
        success: true,
        user: novoOperador
      });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = AuthController;

