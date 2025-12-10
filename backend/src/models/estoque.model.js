const { pool } = require('../config/database');

class EstoqueModel {
  // Buscar todos os itens do estoque com informações do tipo
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT e.ES_Estoque, e.ES_Quantidade, e.Tipo_TP_IDTipo, t.TP_Descricao
      FROM Estoque e
      LEFT JOIN Tipo t ON e.Tipo_TP_IDTipo = t.TP_IDTipo
      ORDER BY t.TP_Descricao
    `);
    return rows.map(row => ({
      id: row.ES_Estoque,
      quantidade: row.ES_Quantidade,
      tipoId: row.Tipo_TP_IDTipo,
      tipoDescricao: row.TP_Descricao
    }));
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT e.ES_Estoque, e.ES_Quantidade, e.Tipo_TP_IDTipo, t.TP_Descricao
      FROM Estoque e
      LEFT JOIN Tipo t ON e.Tipo_TP_IDTipo = t.TP_IDTipo
      WHERE e.ES_Estoque = ?
    `, [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.ES_Estoque,
      quantidade: row.ES_Quantidade,
      tipoId: row.Tipo_TP_IDTipo,
      tipoDescricao: row.TP_Descricao
    };
  }

  // Buscar por tipoId
  static async findByTipoId(tipoId) {
    const [rows] = await pool.query(`
      SELECT e.ES_Estoque, e.ES_Quantidade, e.Tipo_TP_IDTipo, t.TP_Descricao
      FROM Estoque e
      LEFT JOIN Tipo t ON e.Tipo_TP_IDTipo = t.TP_IDTipo
      WHERE e.Tipo_TP_IDTipo = ?
    `, [tipoId]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.ES_Estoque,
      quantidade: row.ES_Quantidade,
      tipoId: row.Tipo_TP_IDTipo,
      tipoDescricao: row.TP_Descricao
    };
  }

  // Criar novo item no estoque
  static async create(data) {
    const { quantidade, tipoId } = data;
    const [result] = await pool.query(
      'INSERT INTO Estoque (ES_Quantidade, Tipo_TP_IDTipo) VALUES (?, ?)',
      [quantidade, tipoId]
    );
    return this.findById(result.insertId);
  }

  // Atualizar item do estoque
  static async update(id, data) {
    const { quantidade, tipoId } = data;
    await pool.query(
      'UPDATE Estoque SET ES_Quantidade = ?, Tipo_TP_IDTipo = ? WHERE ES_Estoque = ?',
      [quantidade, tipoId, id]
    );
    return this.findById(id);
  }

  // Atualizar apenas quantidade
  static async updateQuantidade(id, quantidade) {
    await pool.query(
      'UPDATE Estoque SET ES_Quantidade = ? WHERE ES_Estoque = ?',
      [quantidade, id]
    );
    return this.findById(id);
  }

  // Deletar item do estoque
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM Estoque WHERE ES_Estoque = ?', [id]);
    return result.affectedRows > 0;
  }

  // Buscar itens com estoque baixo (menor que limite)
  static async findLowStock(limite = 10) {
    const [rows] = await pool.query(`
      SELECT e.ES_Estoque, e.ES_Quantidade, e.Tipo_TP_IDTipo, t.TP_Descricao
      FROM Estoque e
      LEFT JOIN Tipo t ON e.Tipo_TP_IDTipo = t.TP_IDTipo
      WHERE CAST(e.ES_Quantidade AS SIGNED) < ?
      ORDER BY CAST(e.ES_Quantidade AS SIGNED)
    `, [limite]);
    return rows.map(row => ({
      id: row.ES_Estoque,
      quantidade: row.ES_Quantidade,
      tipoId: row.Tipo_TP_IDTipo,
      tipoDescricao: row.TP_Descricao
    }));
  }
}

module.exports = EstoqueModel;

