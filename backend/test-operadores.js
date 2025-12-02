require('dotenv').config();
const mysql = require('mysql2/promise');

async function testOperadoresAPI() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sanem_db'
        });

        console.log('✅ Conectado ao banco de dados');

        const [rows] = await connection.query('SELECT * FROM Operaor');
        console.log(`✅ Encontrados ${rows.length} operadores na tabela`);

        if (rows.length > 0) {
            console.log('\nPrimeiro operador:', {
                id: rows[0].ID_Operador,
                nome: rows[0].Op_Nome,
                email: rows[0].Op_Email,
                tipo: rows[0].Op_Tipo
            });
        } else {
            console.log('⚠️  Tabela Operaor está vazia!');
        }

        await connection.end();
        console.log('\n✅ Teste concluído com sucesso!');
    } catch (error) {
        console.error('\n❌ Erro ao conectar/consultar banco:', error.message);
        console.error('Código do erro:', error.code);
    }
}

testOperadoresAPI();
