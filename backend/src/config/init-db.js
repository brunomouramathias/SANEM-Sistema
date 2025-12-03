const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    console.log('--- VERIFICANDO BANCO DE DADOS ---');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true // Permitir múltiplos comandos SQL
    };

    let connection;

    try {
        connection = await mysql.createConnection(config);

        // Verificar se o banco existe
        const [rows] = await connection.query(`SHOW DATABASES LIKE 'sanem_db'`);

        if (rows.length === 0) {
            console.log('⚠️ Banco de dados sanem_db não encontrado.');
            console.log('🔄 Iniciando auto-configuração (Primeira Execução)...');

            // Ler schema.sql
            const schemaPath = path.join(__dirname, '../../../database/schema.sql');
            if (!fs.existsSync(schemaPath)) {
                throw new Error(`Arquivo de schema não encontrado em: ${schemaPath}`);
            }

            const sql = fs.readFileSync(schemaPath, 'utf8');

            // Executar script
            console.log('📂 Executando schema.sql...');
            await connection.query(sql);

            console.log('✅ Banco de dados criado e populado com sucesso!');
        } else {
            console.log('✅ Banco de dados sanem_db já existe.');

            // Opcional: Verificar se tabelas existem e admin existe
            await connection.changeUser({ database: 'sanem_db' });
            const [users] = await connection.query("SELECT * FROM Operaor WHERE Op_Email = 'admin@sanem.org'");
            if (users.length === 0) {
                console.log('⚠️ Admin não encontrado. Criando...');
                // Hash de 'admin123'
                const pass = '$2a$10$Sp889zj8wxgd3wJjSClARemdajdFMl7SgfVWu4Ct3/pGVhDObTN.6';
                await connection.query("INSERT INTO Operaor (Op_Nome, Op_Documento, Op_Email, Op_Senha, Op_Tipo) VALUES ('Administrador', '00000000000', 'admin@sanem.org', ?, 1)", [pass]);
                console.log('✅ Admin recriado.');
            }
        }

    } catch (error) {
        console.error('❌ ERRO NA INICIALIZAÇÃO DO BANCO:', error.message);
        // Não matar o processo, pois o banco pode estar indisponível temporariamente
    } finally {
        if (connection) await connection.end();
    }
    console.log('--- VERIFICAÇÃO CONCLUÍDA ---');
}

module.exports = initDB;
