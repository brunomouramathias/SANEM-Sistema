import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { Package, Users, Truck, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function Dashboard() {
  const { produtos, beneficiarios, distribuicoes } = useApp()

  const totalProdutos = produtos.length
  const totalEstoque = produtos.reduce((sum, p) => sum + p.estoque, 0)
  const totalBeneficiarios = beneficiarios.length
  const totalDistribuicoes = distribuicoes.length

  // Dados para o gráfico
  const chartData = [
    { mes: 'Jan', distribuicoes: 0 },
    { mes: 'Fev', distribuicoes: 0 },
    { mes: 'Mar', distribuicoes: 0 },
    { mes: 'Abr', distribuicoes: 0 },
    { mes: 'Mai', distribuicoes: 0 },
    { mes: 'Jun', distribuicoes: 0 },
    { mes: 'Jul', distribuicoes: 0 },
    { mes: 'Ago', distribuicoes: 0 },
    { mes: 'Set', distribuicoes: 0 },
    { mes: 'Out', distribuicoes: 0 },
    { mes: 'Nov', distribuicoes: distribuicoes.length },

  ]

  const stats = [
    {
      title: 'Total de Roupas',
      value: totalProdutos,
      subtitle: `${totalEstoque} peças em estoque`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Beneficiários',
      value: totalBeneficiarios,
      subtitle: 'Cadastrados no sistema',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Distribuições',
      value: totalDistribuicoes,
      subtitle: 'Realizadas no total',
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Taxa de Crescimento',
      value: '+100%',
      subtitle: 'Em relação ao mês anterior',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6 sm:space-y-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Gráfico de Distribuições */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribuições por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="distribuicoes" fill="hsl(var(--primary))" name="Distribuições" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Informações Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Roupas com Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {produtos
                  .filter(p => p.estoque < 60)
                  .slice(0, 5)
                  .map(produto => (
                    <div key={produto.id} className="flex justify-between items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">{produto.categoria}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600 flex-shrink-0">
                        {produto.estoque} peças
                      </span>
                    </div>
                  ))}
                {produtos.filter(p => p.estoque < 60).length === 0 && (
                  <p className="text-sm text-muted-foreground">Todas as roupas com estoque adequado</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Últimas Distribuições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {distribuicoes
                  .slice(-5)
                  .reverse()
                  .map(dist => (
                    <div key={dist.id} className="flex justify-between items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{dist.beneficiarioNome}</p>
                        <p className="text-sm text-muted-foreground">
                          {dist.produtos.length} {dist.produtos.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground flex-shrink-0">
                        {new Date(dist.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
