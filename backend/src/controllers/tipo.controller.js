const TipoModel = require('../models/tipo.model');

class TipoController {
  // Listar todos
  static async index(req, res) {
    try {
      const tipos = await TipoModel.findAll();
      return res.json(tipos);
    } catch (error) {
      console.error('Erro ao listar tipos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar por ID
  static async show(req, res) {
    try {
      const { id } = req.params;
      const tipo = await TipoModel.findById(id);
      
      if (!tipo) {
        return res.status(404).json({ error: 'Tipo não encontrado' });
      }

      return res.json(tipo);
    } catch (error) {
      console.error('Erro ao buscar tipo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo
  static async store(req, res) {
    try {
      const { descricao } = req.body;

      if (!descricao || !descricao.trim()) {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
      }

      // Verificar se já existe um tipo com essa descrição
      const exists = await TipoModel.existsByDescricao(descricao);
      if (exists) {
        return res.status(409).json({ 
          error: 'Já existe um produto com este nome',
          field: 'nome'
        });
      }

      const tipo = await TipoModel.create({ descricao: descricao.trim() });
      return res.status(201).json(tipo);
    } catch (error) {
      console.error('Erro ao criar tipo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { descricao } = req.body;

      if (!descricao || !descricao.trim()) {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
      }

      const existente = await TipoModel.findById(id);
      if (!existente) {
        return res.status(404).json({ error: 'Tipo não encontrado' });
      }

      // Verificar se já existe outro tipo com essa descrição
      const exists = await TipoModel.existsByDescricao(descricao, id);
      if (exists) {
        return res.status(409).json({ 
          error: 'Já existe um produto com este nome',
          field: 'nome'
        });
      }

      const tipo = await TipoModel.update(id, { descricao: descricao.trim() });
      return res.json(tipo);
    } catch (error) {
      console.error('Erro ao atualizar tipo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar
  static async destroy(req, res) {
    try {
      const { id } = req.params;

      const existente = await TipoModel.findById(id);
      if (!existente) {
        return res.status(404).json({ error: 'Tipo não encontrado' });
      }

      await TipoModel.delete(id);
      return res.json({ message: 'Tipo removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar tipo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = TipoController;

