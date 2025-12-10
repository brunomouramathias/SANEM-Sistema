-- Script para remover tipos (produtos) duplicados ANTES de adicionar a constraint UNIQUE
-- USE COM CUIDADO! Este script irá deletar dados.

USE sanem_db;

-- 1. Ver quais tipos estão duplicados
SELECT TP_Descricao, COUNT(*) as quantidade, GROUP_CONCAT(TP_IDTipo) as ids
FROM Tipo
GROUP BY TP_Descricao
HAVING COUNT(*) > 1;

-- 2. Para cada tipo duplicado, manter apenas o primeiro e deletar os outros
-- Isso também atualiza as referências no estoque

-- ATENÇÃO: Revise os IDs antes de executar!
-- Este é um exemplo, você precisará adaptar para seus dados reais

-- Exemplo: Se "Camiseta" aparece 3 vezes com IDs 1, 5, 8
-- Vamos manter o ID 1 e deletar 5 e 8

-- Atualizar referências no estoque para usar o ID mantido
-- UPDATE Estoque SET Tipo_TP_IDTipo = 1 WHERE Tipo_TP_IDTipo IN (5, 8);

-- Deletar os tipos duplicados
-- DELETE FROM Tipo WHERE TP_IDTipo IN (5, 8);

-- 3. Verificar se ainda existem duplicatas
SELECT TP_Descricao, COUNT(*) as quantidade
FROM Tipo
GROUP BY TP_Descricao
HAVING COUNT(*) > 1;

-- Se não retornar nada, está pronto para adicionar a constraint!
-- Execute o script: add-unique-constraint.sql


