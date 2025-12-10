-- Script para verificar doações recebidas e enviadas
-- Execute este script para validar se as correções estão funcionando

USE sanem_db;

-- ============================================
-- 1. DOAÇÕES RECEBIDAS (Entrada de Produtos)
-- ============================================

SELECT 
    '=== DOAÇÕES RECEBIDAS ===' as '';

SELECT 
    dr.DR_IDDoacao as 'ID',
    t.TP_Descricao as 'Produto',
    dr.DR_Quantidade as 'Quantidade',
    o.Op_Nome as 'Operador',
    DATE_FORMAT(dr.DR_Data, '%d/%m/%Y %H:%i') as 'Data'
FROM Doacao_Recebida dr
LEFT JOIN Tipo t ON dr.DR_Tipo = t.TP_IDTipo
LEFT JOIN Operaor o ON dr.DR_Operador = o.ID_Operador
ORDER BY dr.DR_Data DESC
LIMIT 20;

SELECT 
    '' as '',
    '=== TOTAL POR TIPO (RECEBIDAS) ===' as '';

SELECT 
    t.TP_Descricao as 'Produto',
    SUM(dr.DR_Quantidade) as 'Total Recebido'
FROM Doacao_Recebida dr
LEFT JOIN Tipo t ON dr.DR_Tipo = t.TP_IDTipo
GROUP BY t.TP_Descricao
ORDER BY SUM(dr.DR_Quantidade) DESC;

-- ============================================
-- 2. DOAÇÕES ENVIADAS (Distribuições)
-- ============================================

SELECT 
    '' as '',
    '=== DOAÇÕES ENVIADAS (DISTRIBUIÇÕES) ===' as '';

SELECT 
    de.Doacao_Enviada as 'ID',
    t.TP_Descricao as 'Produto',
    de.DE_Quantidade as 'Quantidade',
    b.Bn_Nome as 'Beneficiário',
    o.Op_Nome as 'Operador',
    DATE_FORMAT(de.DE_Data, '%d/%m/%Y %H:%i') as 'Data'
FROM Doacao_Enviada de
LEFT JOIN Tipo t ON de.DE_Tipo = t.TP_IDTipo
LEFT JOIN Beneficiario b ON de.DE_idBeneficiario = b.idBeneficiario
LEFT JOIN Operaor o ON de.DE_Operador = o.ID_Operador
ORDER BY de.DE_Data DESC
LIMIT 20;

SELECT 
    '' as '',
    '=== TOTAL POR BENEFICIÁRIO ===' as '';

SELECT 
    b.Bn_Nome as 'Beneficiário',
    COUNT(DISTINCT DATE(de.DE_Data)) as 'Nº Distribuições',
    SUM(de.DE_Quantidade) as 'Total Itens'
FROM Doacao_Enviada de
LEFT JOIN Beneficiario b ON de.DE_idBeneficiario = b.idBeneficiario
GROUP BY b.Bn_Nome
ORDER BY SUM(de.DE_Quantidade) DESC;

SELECT 
    '' as '',
    '=== TOTAL POR TIPO (ENVIADAS) ===' as '';

SELECT 
    t.TP_Descricao as 'Produto',
    SUM(de.DE_Quantidade) as 'Total Distribuído'
FROM Doacao_Enviada de
LEFT JOIN Tipo t ON de.DE_Tipo = t.TP_IDTipo
GROUP BY t.TP_Descricao
ORDER BY SUM(de.DE_Quantidade) DESC;

-- ============================================
-- 3. ESTOQUE ATUAL
-- ============================================

SELECT 
    '' as '',
    '=== ESTOQUE ATUAL ===' as '';

SELECT 
    e.ES_Estoque as 'ID Estoque',
    t.TP_Descricao as 'Produto',
    e.ES_Quantidade as 'Quantidade Disponível',
    t.TP_IDTipo as 'ID Tipo'
FROM Estoque e
LEFT JOIN Tipo t ON e.Tipo_TP_IDTipo = t.TP_IDTipo
ORDER BY t.TP_Descricao;

-- ============================================
-- 4. BALANÇO (Recebidas vs Enviadas vs Estoque)
-- ============================================

SELECT 
    '' as '',
    '=== BALANÇO GERAL ===' as '';

SELECT 
    t.TP_Descricao as 'Produto',
    COALESCE(recebidas.total, 0) as 'Total Recebido',
    COALESCE(enviadas.total, 0) as 'Total Distribuído',
    e.ES_Quantidade as 'Estoque Atual',
    CASE 
        WHEN COALESCE(recebidas.total, 0) - COALESCE(enviadas.total, 0) = e.ES_Quantidade 
        THEN '✓ OK'
        ELSE '✗ DIVERGÊNCIA'
    END as 'Status'
FROM Tipo t
LEFT JOIN Estoque e ON t.TP_IDTipo = e.Tipo_TP_IDTipo
LEFT JOIN (
    SELECT DR_Tipo, SUM(DR_Quantidade) as total
    FROM Doacao_Recebida
    GROUP BY DR_Tipo
) recebidas ON t.TP_IDTipo = recebidas.DR_Tipo
LEFT JOIN (
    SELECT DE_Tipo, SUM(DE_Quantidade) as total
    FROM Doacao_Enviada
    GROUP BY DE_Tipo
) enviadas ON t.TP_IDTipo = enviadas.DE_Tipo
ORDER BY t.TP_Descricao;

-- ============================================
-- 5. ÚLTIMAS MOVIMENTAÇÕES
-- ============================================

SELECT 
    '' as '',
    '=== ÚLTIMAS 10 MOVIMENTAÇÕES ===' as '';

(
    SELECT 
        'RECEBIDA' as Tipo,
        t.TP_Descricao as Produto,
        dr.DR_Quantidade as Quantidade,
        '-' as Beneficiário,
        o.Op_Nome as Operador,
        dr.DR_Data as Data
    FROM Doacao_Recebida dr
    LEFT JOIN Tipo t ON dr.DR_Tipo = t.TP_IDTipo
    LEFT JOIN Operaor o ON dr.DR_Operador = o.ID_Operador
)
UNION ALL
(
    SELECT 
        'ENVIADA' as Tipo,
        t.TP_Descricao as Produto,
        de.DE_Quantidade as Quantidade,
        b.Bn_Nome as Beneficiário,
        o.Op_Nome as Operador,
        de.DE_Data as Data
    FROM Doacao_Enviada de
    LEFT JOIN Tipo t ON de.DE_Tipo = t.TP_IDTipo
    LEFT JOIN Beneficiario b ON de.DE_idBeneficiario = b.idBeneficiario
    LEFT JOIN Operaor o ON de.DE_Operador = o.ID_Operador
)
ORDER BY Data DESC
LIMIT 10;

-- ============================================
-- 6. DIAGNÓSTICO
-- ============================================

SELECT 
    '' as '',
    '=== DIAGNÓSTICO ===' as '';

SELECT 
    'Total de Tipos (Produtos)' as Métrica,
    COUNT(*) as Valor
FROM Tipo
UNION ALL
SELECT 
    'Total de Itens no Estoque',
    COUNT(*)
FROM Estoque
UNION ALL
SELECT 
    'Total de Doações Recebidas',
    COUNT(*)
FROM Doacao_Recebida
UNION ALL
SELECT 
    'Total de Doações Enviadas',
    COUNT(*)
FROM Doacao_Enviada
UNION ALL
SELECT 
    'Total de Beneficiários',
    COUNT(*)
FROM Beneficiario
UNION ALL
SELECT 
    'Total de Operadores',
    COUNT(*)
FROM Operaor;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

SELECT 
    '' as '',
    '✅ Verificação concluída!' as '';

