-- Script para adicionar constraint UNIQUE na tabela Tipo
-- Isso garante que não existam produtos com nomes duplicados no banco de dados

-- IMPORTANTE: Execute este script apenas UMA VEZ
-- Caso já existam produtos duplicados, você precisará removê-los primeiro

USE sanem_db;

-- 1. Verificar se existem tipos duplicados
SELECT TP_Descricao, COUNT(*) as quantidade
FROM Tipo
GROUP BY TP_Descricao
HAVING COUNT(*) > 1;

-- Se a consulta acima retornou resultados, há duplicatas!
-- Você precisará decidir quais manter antes de prosseguir.

-- 2. Adicionar a constraint UNIQUE (execute apenas se não houver duplicatas)
ALTER TABLE Tipo
ADD CONSTRAINT UK_Tipo_Descricao UNIQUE (TP_Descricao);

-- 3. Verificar se a constraint foi adicionada
SHOW INDEX FROM Tipo WHERE Key_name = 'UK_Tipo_Descricao';

-- Pronto! Agora o banco de dados não permitirá tipos (produtos) com nomes duplicados


