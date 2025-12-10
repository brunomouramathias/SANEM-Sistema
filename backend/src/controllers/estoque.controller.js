const EstoqueModel = require('../models/estoque.model');

class EstoqueController {
  // Listar todos
  static async index(req, res) {
    try {
      const estoque = await EstoqueModel.findAll();
      return res.json(estoque);
    } catch (error) {
      console.error('Erro ao listar estoque:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar por ID
  static async show(req, res) {
    try {
      const { id } = req.params;
      const item = await EstoqueModel.findById(id);
      
      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      return res.json(item);
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo
  static async store(req, res) {
    try {
      const { quantidade, tipoId } = req.body;

      if (!tipoId) {
        return res.status(400).json({ error: 'Tipo é obrigatório' });
      }

      // Verificar se já existe item no estoque para este tipo
      const existente = await EstoqueModel.findByTipoId(tipoId);
      if (existente) {
        return res.status(409).json({ 
          error: 'Já existe um item no estoque para este tipo de produto',
          field: 'tipoId'
        });
      }

      const item = await EstoqueModel.create({ quantidade: quantidade || 0, tipoId });
      return res.status(201).json(item);
    } catch (error) {
      console.error('Erro ao criar item:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { quantidade, tipoId } = req.body;

      const existente = await EstoqueModel.findById(id);
      if (!existente) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      const item = await EstoqueModel.update(id, { quantidade, tipoId });
      return res.json(item);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar
  static async destroy(req, res) {
    try {
      const { id } = req.params;

      const existente = await EstoqueModel.findById(id);
      if (!existente) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      await EstoqueModel.delete(id);
      return res.json({ message: 'Item removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar estoque baixo
  static async lowStock(req, res) {
    try {
      const { limite } = req.query;
      const itens = await EstoqueModel.findLowStock(parseInt(limite) || 10);
      return res.json(itens);
    } catch (error) {
      console.error('Erro ao buscar estoque baixo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = EstoqueController;

