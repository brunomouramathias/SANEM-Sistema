import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const AppContext = createContext()

// Dados de fallback (quando API não disponível)
const fallbackData = {
  produtos: [
    { id: 1, nome: 'Camiseta Masculina', categoria: 'Masculino', estoque: 150 },
    { id: 2, nome: 'Calça Jeans Masculina', categoria: 'Masculino', estoque: 80 },
    { id: 3, nome: 'Blusa Feminina', categoria: 'Feminino', estoque: 120 },
    { id: 4, nome: 'Vestido Feminino', categoria: 'Feminino', estoque: 65 },
    { id: 5, nome: 'Roupa Infantil', categoria: 'Infantil', estoque: 200 },
    { id: 6, nome: 'Tênis', categoria: 'Calçados', estoque: 45 },
    { id: 7, nome: 'Casaco', categoria: 'Agasalhos', estoque: 55 },
    { id: 8, nome: 'Meias', categoria: 'Acessórios', estoque: 300 },
  ],
  beneficiarios: [
    { id: 1, nome: 'Maria Silva Santos', documento: '123.456.789-00', telefone: '(11) 98765-4321' },
    { id: 2, nome: 'João Pedro Oliveira', documento: '987.654.321-00', telefone: '(11) 91234-5678' },
    { id: 3, nome: 'Ana Paula Costa', documento: '456.789.123-00', telefone: '(11) 99876-5432' },
    { id: 4, nome: 'Carlos Alberto Souza', documento: '321.654.987-00', telefone: '(11) 97654-3210' },
  ],
  distribuicoes: []
}

// Helper para requisições
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }
  const response = await fetch(`${API_URL}${endpoint}`, config)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro' }))
    throw new Error(error.error || 'Erro na requisição')
  }
  return response.json()
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [beneficiarios, setBeneficiarios] = useState([])
  const [distribuicoes, setDistribuicoes] = useState([])
  const [useAPI, setUseAPI] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    loadData()
  }, [])

  // Verificar token ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Opcional: decodificar token para ver se é antigo (pela data de expiração)
      // Mas vamos confiar no loadData para validar
    }
  }, []);

  // Carregar dados (tenta API, se falhar usa fallback)
  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Sem token, usar fallback
        setProdutos(fallbackData.produtos)
        setBeneficiarios(fallbackData.beneficiarios)
        setDistribuicoes(fallbackData.distribuicoes)
        return
      }

      const [estoque, benef, doacoes] = await Promise.all([
        apiRequest('/estoque'),
        apiRequest('/beneficiarios'),
        apiRequest('/doacoes/enviadas')
      ])

      setProdutos(estoque.map(item => ({
        id: item.id,
        nome: item.tipoDescricao,
        categoria: 'Geral',
        estoque: parseInt(item.quantidade) || 0,
        tipoId: item.tipoId
      })))
      setBeneficiarios(benef)
      setDistribuicoes(doacoes.map(d => ({ ...d, data: new Date(d.data) })))
      setUseAPI(true)
    } catch (error) {
      // Se for erro de autenticação, não usar fallback e deixar redirecionar
      if (error.message?.includes('Sessão expirada') || error.message?.includes('Token')) {
        console.error('Sessão expirada, redirecionando...')
        setUseAPI(false)
        return
      }

      console.log('API indisponível, usando dados locais')
      setUseAPI(false)
      // Carregar do localStorage ou usar fallback
      const storedProdutos = localStorage.getItem('produtos')
      const storedBenef = localStorage.getItem('beneficiarios')
      const storedDist = localStorage.getItem('distribuicoes')

      setProdutos(storedProdutos ? JSON.parse(storedProdutos) : fallbackData.produtos)
      setBeneficiarios(storedBenef ? JSON.parse(storedBenef) : fallbackData.beneficiarios)
      setDistribuicoes(storedDist ? JSON.parse(storedDist).map(d => ({ ...d, data: new Date(d.data) })) : [])
    }
  }

  // Salvar no localStorage quando não usa API
  useEffect(() => {
    if (!useAPI && produtos.length > 0) {
      localStorage.setItem('produtos', JSON.stringify(produtos))
    }
  }, [produtos, useAPI])

  useEffect(() => {
    if (!useAPI && beneficiarios.length > 0) {
      localStorage.setItem('beneficiarios', JSON.stringify(beneficiarios))
    }
  }, [beneficiarios, useAPI])

  useEffect(() => {
    if (!useAPI && distribuicoes.length > 0) {
      localStorage.setItem('distribuicoes', JSON.stringify(distribuicoes))
    }
  }, [distribuicoes, useAPI])

  // Login
  const login = async (email, senha) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      })

      if (response.success) {
        setUser(response.user)
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUseAPI(true)
        await loadData()
        return { success: true }
      }
      return { success: false, error: 'Erro ao fazer login' }
    } catch (error) {
      // Fallback: login local
      if (email === 'admin@sanem.org' && senha === 'admin123') {
        const userData = { nome: 'Administrador', email }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        setUseAPI(false)
        await loadData()
        return { success: true }
      }
      return { success: false, error: 'Credenciais inválidas' }
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Produtos
  const addProduto = async (produto) => {
    if (useAPI) {
      try {
        await apiRequest('/estoque', { method: 'POST', body: JSON.stringify({ quantidade: produto.estoque, tipoId: 1 }) })
        await loadData()
      } catch { /* fallback */ }
    }
    const newProduto = { ...produto, id: Math.max(...produtos.map(p => p.id), 0) + 1 }
    setProdutos([...produtos, newProduto])
  }

  const updateProduto = async (id, produtoAtualizado) => {
    if (useAPI) {
      try {
        // Chamar API para atualizar no backend
        await apiRequest(`/estoque/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            quantidade: produtoAtualizado.estoque,
            tipoId: produtos.find(p => p.id === id)?.tipoId || 1
          })
        })
        // Recarregar dados do servidor após atualização
        await loadData()
        return
      } catch (error) {
        console.error('Erro ao atualizar produto na API:', error)
        // Em caso de erro, continua com atualização local
      }
    }
    // Fallback: atualizar apenas localmente
    setProdutos(produtos.map(p => p.id === id ? { ...p, ...produtoAtualizado } : p))
  }

  const deleteProduto = (id) => {
    setProdutos(produtos.filter(p => p.id !== id))
  }

  // Beneficiários
  const addBeneficiario = async (beneficiario) => {
    if (useAPI) {
      try {
        await apiRequest('/beneficiarios', { method: 'POST', body: JSON.stringify(beneficiario) })
        await loadData()
        return
      } catch { /* fallback */ }
    }
    const newBeneficiario = { ...beneficiario, id: Math.max(...beneficiarios.map(b => b.id), 0) + 1 }
    setBeneficiarios([...beneficiarios, newBeneficiario])
  }

  const updateBeneficiario = (id, beneficiarioAtualizado) => {
    setBeneficiarios(beneficiarios.map(b => b.id === id ? { ...b, ...beneficiarioAtualizado } : b))
  }

  const deleteBeneficiario = (id) => {
    setBeneficiarios(beneficiarios.filter(b => b.id !== id))
  }

  // Distribuição
  const addDistribuicao = (distribuicao) => {
    const newDistribuicao = {
      ...distribuicao,
      id: Math.max(...distribuicoes.map(d => d.id), 0) + 1,
      data: new Date(),
      responsavel: user?.nome || 'Admin'
    }

    // Atualizar estoque
    distribuicao.produtos.forEach(produto => {
      const produtoEstoque = produtos.find(p => p.id === produto.id)
      if (produtoEstoque) {
        updateProduto(produto.id, { estoque: produtoEstoque.estoque - produto.quantidade })
      }
    })

    setDistribuicoes([...distribuicoes, newDistribuicao])
  }

  const value = {
    user,
    login,
    logout,
    produtos,
    addProduto,
    updateProduto,
    deleteProduto,
    beneficiarios,
    addBeneficiario,
    updateBeneficiario,
    deleteBeneficiario,
    distribuicoes,
    addDistribuicao,
    useAPI,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider')
  }
  return context
}
