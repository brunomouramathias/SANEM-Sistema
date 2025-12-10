import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApp } from '@/context/AppContext'
import { FileText, Download, Filter, Package, Users, Truck } from 'lucide-react'
// import jsPDF from 'jspdf'
// import 'jspdf-autotable'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export function Relatorios() {
  const { distribuicoes, beneficiarios, produtos } = useApp()
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [beneficiarioFiltro, setBeneficiarioFiltro] = useState('')
  const [produtoFiltro, setProdutoFiltro] = useState('')
  const [showResults, setShowResults] = useState(false)

  // Filtrar distribuições
  const distribuicoesFiltradas = useMemo(() => {
    return distribuicoes.filter(dist => {
      // Filtro por data
      if (dataInicio) {
        const dataInicioObj = new Date(dataInicio)
        if (new Date(dist.data) < dataInicioObj) return false
      }
      if (dataFim) {
        const dataFimObj = new Date(dataFim)
        dataFimObj.setHours(23, 59, 59, 999)
        if (new Date(dist.data) > dataFimObj) return false
      }

      // Filtro por beneficiário
      if (beneficiarioFiltro && dist.beneficiarioId !== parseInt(beneficiarioFiltro)) {
        return false
      }

      // Filtro por produto
      if (produtoFiltro) {
        const temProduto = dist.produtos.some(p => p.id === parseInt(produtoFiltro))
        if (!temProduto) return false
      }

      return true
    })
  }, [distribuicoes, dataInicio, dataFim, beneficiarioFiltro, produtoFiltro])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalDistribuicoes = distribuicoesFiltradas.length
    const beneficiariosUnicos = new Set(distribuicoesFiltradas.map(d => d.beneficiarioId)).size
    
    const produtosDistribuidos = {}
    distribuicoesFiltradas.forEach(dist => {
      dist.produtos.forEach(prod => {
        if (!produtosDistribuidos[prod.nome]) {
          produtosDistribuidos[prod.nome] = 0
        }
        // IMPORTANTE: Converter para número para evitar concatenação de strings
        const quantidade = parseInt(prod.quantidade) || 0
        produtosDistribuidos[prod.nome] += quantidade
      })
    })
    
    const totalProdutos = Object.values(produtosDistribuidos).reduce((a, b) => a + b, 0)

    console.log('📊 Estatísticas calculadas:')
    console.log('  - Total de distribuições:', totalDistribuicoes)
    console.log('  - Beneficiários únicos:', beneficiariosUnicos)
    console.log('  - Total de produtos:', totalProdutos)
    console.log('  - Produtos distribuídos:', produtosDistribuidos)

    return {
      totalDistribuicoes,
      beneficiariosUnicos,
      totalProdutos,
      produtosDistribuidos
    }
  }, [distribuicoesFiltradas])

  const handleGerarRelatorio = () => {
    setShowResults(true)
  }

  const handleLimparFiltros = () => {
    setDataInicio('')
    setDataFim('')
    setBeneficiarioFiltro('')
    setProdutoFiltro('')
    setShowResults(false)
  }

  const exportarCSV = () => {
    const headers = ['Data', 'Beneficiário', 'Roupas', 'Quantidades', 'Responsável']
    const rows = distribuicoesFiltradas.map(dist => [
      new Date(dist.data).toLocaleString('pt-BR'),
      dist.beneficiarioNome,
      dist.produtos.map(p => p.nome).join('; '),
      dist.produtos.map(p => `${p.quantidade}`).join('; '),
      dist.responsavel
    ])

    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_sanem_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(18)
    doc.text('Sistema Sanem - Relatório de Distribuições', 14, 20)
    
    // Informações do filtro
    doc.setFontSize(10)
    let y = 30
    if (dataInicio || dataFim) {
      doc.text(`Período: ${dataInicio || 'Início'} até ${dataFim || 'Fim'}`, 14, y)
      y += 6
    }
    
    // Estatísticas
    doc.setFontSize(12)
    doc.text('Resumo:', 14, y)
    y += 8
    doc.setFontSize(10)
    doc.text(`Total de Distribuições: ${stats.totalDistribuicoes}`, 14, y)
    y += 6
    doc.text(`Beneficiários Atendidos: ${stats.beneficiariosUnicos}`, 14, y)
    y += 6
    doc.text(`Total de Produtos Distribuídos: ${stats.totalProdutos}`, 14, y)
    y += 10

    // Tabela de distribuições
    const tableData = distribuicoesFiltradas.map(dist => [
      new Date(dist.data).toLocaleDateString('pt-BR'),
      dist.beneficiarioNome,
      dist.produtos.map(p => `${p.nome} (${p.quantidade})`).join(', '),
      dist.responsavel
    ])

    autoTable(doc, {
      startY: y,
      head: [['Data', 'Beneficiário', 'Produtos', 'Responsável']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    

    doc.save(`relatorio_sanem_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <MainLayout title="Relatórios">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-medium">Gerar Relatórios</h3>
          <p className="text-sm text-muted-foreground">
            Filtre e exporte relatórios de distribuições de roupas
          </p>
        </div>

        {/* Card de Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Inicial</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Final</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiario">Beneficiário (opcional)</Label>
                <Select
                  id="beneficiario"
                  value={beneficiarioFiltro}
                  onChange={(e) => setBeneficiarioFiltro(e.target.value)}
                >
                  <option value="">Todos os beneficiários</option>
                  {beneficiarios.map((beneficiario) => (
                    <option key={beneficiario.id} value={beneficiario.id}>
                      {beneficiario.nome}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="produto">Roupa (opcional)</Label>
                <Select
                  id="produto"
                  value={produtoFiltro}
                  onChange={(e) => setProdutoFiltro(e.target.value)}
                >
                  <option value="">Todas as roupas</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleGerarRelatorio} className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button variant="outline" onClick={handleLimparFiltros} className="w-full sm:w-auto">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {showResults && (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Distribuições
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDistribuicoes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Beneficiários Atendidos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.beneficiariosUnicos}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Roupas Distribuídas
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProdutos}</div>
                  <p className="text-xs text-muted-foreground">peças no total</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Resultados */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <CardTitle className="text-base sm:text-lg">Detalhamento das Distribuições</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" onClick={exportarCSV} className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportarPDF} className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {distribuicoesFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">
                      Nenhuma distribuição encontrada com os filtros selecionados
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop - Tabela */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                              <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Beneficiário</TableHead>
                                <TableHead>Roupas</TableHead>
                                <TableHead>Responsável</TableHead>
                              </TableRow>
                        </TableHeader>
                        <TableBody>
                          {distribuicoesFiltradas.map((dist) => (
                            <TableRow key={dist.id}>
                              <TableCell className="whitespace-nowrap">
                                {new Date(dist.data).toLocaleString('pt-BR')}
                              </TableCell>
                              <TableCell className="font-medium">
                                {dist.beneficiarioNome}
                              </TableCell>
                              <TableCell>
                                {dist.produtos.map(p => `${p.nome} (${p.quantidade})`).join(', ')}
                              </TableCell>
                              <TableCell>{dist.responsavel}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile - Cards */}
                    <div className="md:hidden space-y-3">
                      {distribuicoesFiltradas.map((dist) => (
                        <div key={dist.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{dist.beneficiarioNome}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(dist.data).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {dist.responsavel}
                            </span>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-xs text-muted-foreground mb-1">Roupas:</p>
                            <p className="text-xs">
                              {dist.produtos.map(p => `${p.nome} (${p.quantidade})`).join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Breakdown por Produto */}
            {Object.keys(stats.produtosDistribuidos).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Distribuição por Tipo de Roupa</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roupa</TableHead>
                        <TableHead className="text-right">Quantidade Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(stats.produtosDistribuidos)
                        .sort((a, b) => b[1] - a[1])
                        .map(([nome, quantidade]) => (
                          <TableRow key={nome}>
                            <TableCell className="font-medium">{nome}</TableCell>
                            <TableCell className="text-right">{quantidade} peças</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
