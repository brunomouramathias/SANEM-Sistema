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
        console.log('⚠️ Sem token - usando dados de fallback')
        setProdutos(fallbackData.produtos)
        setBeneficiarios(fallbackData.beneficiarios)
        setDistribuicoes(fallbackData.distribuicoes)
        setUseAPI(false)
        return
      }

      console.log('📡 Carregando dados da API...')
      const [estoque, benef, doacoesEnviadas] = await Promise.all([
        apiRequest('/estoque'),
        apiRequest('/beneficiarios'),
        apiRequest('/doacoes/enviadas')
      ])

      console.log('✅ Dados carregados da API com sucesso')
      console.log('  - Produtos:', estoque.length)
      console.log('  - Beneficiários:', benef.length)
      console.log('  - Doações Enviadas:', doacoesEnviadas.length)

      setProdutos(estoque.map(item => ({
        id: item.id,
        nome: item.tipoDescricao,
        categoria: 'Geral',
        estoque: parseInt(item.quantidade) || 0,
        tipoId: item.tipoId
      })))
      setBeneficiarios(benef)
      
      // Agrupar doações enviadas por beneficiário e data para formar distribuições
      const distribuicoesAgrupadas = {}
      doacoesEnviadas.forEach(doacao => {
        // Usar beneficiarioId + data (sem hora) como chave para agrupar
        const dataKey = new Date(doacao.data).toISOString().split('T')[0]
        const key = `${doacao.beneficiarioId}_${dataKey}`
        
        if (!distribuicoesAgrupadas[key]) {
          distribuicoesAgrupadas[key] = {
            id: doacao.id,
            beneficiarioId: doacao.beneficiarioId,
            beneficiarioNome: doacao.beneficiarioNome,
            data: new Date(doacao.data),
            responsavel: doacao.operadorNome || 'Sistema',
            produtos: []
          }
        }
        
        // IMPORTANTE: Converter quantidade para número para evitar concatenação
        distribuicoesAgrupadas[key].produtos.push({
          nome: doacao.tipoDescricao,
          quantidade: parseInt(doacao.quantidade) || 0
        })
      })
      
      setDistribuicoes(Object.values(distribuicoesAgrupadas))
      setUseAPI(true)
      console.log('🔗 Modo: CONECTADO à API')
      console.log('  - Distribuições agrupadas:', Object.values(distribuicoesAgrupadas).length)
    } catch (error) {
      // Se for erro de autenticação, não usar fallback e deixar redirecionar
      if (error.message?.includes('Sessão expirada') || error.message?.includes('Token')) {
        console.error('❌ Sessão expirada, redirecionando...')
        setUseAPI(false)
        return
      }

      console.log('⚠️ API indisponível, usando dados locais')
      setUseAPI(false)
      // Carregar do localStorage ou usar fallback
      const storedProdutos = localStorage.getItem('produtos')
      const storedBenef = localStorage.getItem('beneficiarios')
      const storedDist = localStorage.getItem('distribuicoes')

      setProdutos(storedProdutos ? JSON.parse(storedProdutos) : fallbackData.produtos)
      setBeneficiarios(storedBenef ? JSON.parse(storedBenef) : fallbackData.beneficiarios)
      setDistribuicoes(storedDist ? JSON.parse(storedDist).map(d => ({ ...d, data: new Date(d.data) })) : [])
      console.log('💾 Modo: OFFLINE (dados locais)')
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
    console.log('➕ Adicionando produto:', produto.nome, '| Quantidade:', produto.estoque, '| useAPI:', useAPI)
    
    if (useAPI) {
      try {
        // 1. Primeiro criar o tipo (produto)
        console.log('📡 Criando tipo/produto:', produto.nome)
        const novoTipo = await apiRequest('/tipos', { 
          method: 'POST', 
          body: JSON.stringify({ descricao: produto.nome })
        })
        console.log('✅ Tipo criado com ID:', novoTipo.id)

        // 2. Criar o item no estoque com quantidade 0
        console.log('📡 Criando item no estoque (quantidade inicial: 0)')
        const novoEstoque = await apiRequest('/estoque', { 
          method: 'POST', 
          body: JSON.stringify({ 
            quantidade: 0, 
            tipoId: novoTipo.id 
          })
        })
        console.log('✅ Estoque criado com ID:', novoEstoque.id)

        // 3. Registrar doação recebida (que irá incrementar o estoque)
        if (produto.estoque > 0) {
          console.log('📡 Registrando doação recebida de', produto.estoque, 'unidades')
          await apiRequest('/doacoes/recebidas', {
            method: 'POST',
            body: JSON.stringify({
              quantidade: produto.estoque,
              tipoId: novoTipo.id,
              estoqueId: novoEstoque.id
            })
          })
          console.log('✅ Doação recebida registrada')
        }
        
        console.log('✅ Produto adicionado com sucesso no sistema!')
        await loadData()
        return
      } catch (error) {
        console.error('❌ Erro ao adicionar produto:', error)
        
        // Se for erro de duplicata, mostrar mensagem específica
        if (error.message.includes('Já existe um produto')) {
          alert('⚠️ Já existe um produto com este nome!\nEscolha um nome diferente.')
          throw error // Não adiciona localmente
        }
        
        alert('Erro ao adicionar produto: ' + error.message)
        throw error
      }
    }
    
    // Fallback: modo offline - verificar duplicatas localmente
    const nomeLower = produto.nome.toLowerCase().trim()
    const jaExiste = produtos.some(p => p.nome.toLowerCase().trim() === nomeLower)
    
    if (jaExiste) {
      alert('⚠️ Já existe um produto com este nome!\nEscolha um nome diferente.')
      throw new Error('Produto duplicado')
    }
    
    const newProduto = { ...produto, id: Math.max(...produtos.map(p => p.id), 0) + 1 }
    setProdutos([...produtos, newProduto])
  }

  const updateProduto = async (id, produtoAtualizado) => {
    console.log('✏️ Atualizando produto ID:', id, '| useAPI:', useAPI)
    
    if (useAPI) {
      try {
        const produtoAtual = produtos.find(p => p.id === id)
        if (!produtoAtual) {
          throw new Error('Produto não encontrado')
        }

        // Se o nome mudou, atualizar o tipo também
        if (produtoAtualizado.nome && produtoAtualizado.nome !== produtoAtual.nome) {
          console.log('📡 Atualizando nome do tipo:', produtoAtualizado.nome)
          await apiRequest(`/tipos/${produtoAtual.tipoId}`, {
            method: 'PUT',
            body: JSON.stringify({ descricao: produtoAtualizado.nome })
          })
        }

        // Atualizar quantidade no estoque
        console.log('📡 Atualizando quantidade no estoque')
        await apiRequest(`/estoque/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            quantidade: produtoAtualizado.estoque,
            tipoId: produtoAtual.tipoId
          })
        })
        
        console.log('✅ Produto atualizado com sucesso')
        await loadData()
        return
      } catch (error) {
        console.error('❌ Erro ao atualizar produto na API:', error)
        
        // Se for erro de duplicata, mostrar mensagem específica
        if (error.message.includes('Já existe um produto')) {
          alert('⚠️ Já existe um produto com este nome!\nEscolha um nome diferente.')
          throw error
        }
        
        alert('Erro ao atualizar: ' + error.message + '\nAs alterações não foram salvas no banco de dados.')
        throw error
      }
    }
    
    // Fallback: modo offline - verificar duplicatas localmente
    if (produtoAtualizado.nome) {
      const nomeLower = produtoAtualizado.nome.toLowerCase().trim()
      const jaExiste = produtos.some(p => 
        p.id !== id && p.nome.toLowerCase().trim() === nomeLower
      )
      
      if (jaExiste) {
        alert('⚠️ Já existe um produto com este nome!\nEscolha um nome diferente.')
        throw new Error('Produto duplicado')
      }
    }
    
    // Atualizar apenas localmente (somente se não está usando API)
    console.log('💾 Atualizando apenas localmente (modo offline)')
    setProdutos(produtos.map(p => p.id === id ? { ...p, ...produtoAtualizado } : p))
  }

  const deleteProduto = async (id) => {
    console.log('🗑️ Deletando produto ID:', id, '| useAPI:', useAPI)
    if (useAPI) {
      try {
        console.log('📡 Chamando API DELETE /estoque/' + id)
        await apiRequest(`/estoque/${id}`, { method: 'DELETE' })
        console.log('✅ Produto deletado com sucesso na API')
        await loadData()
        return
      } catch (error) {
        console.error('❌ Erro ao deletar produto na API:', error)
        console.error('⚠️ ATENÇÃO: Não foi possível deletar no backend!')
        alert('Erro ao deletar: ' + error.message + '\nO item não foi removido do banco de dados.')
        return // NÃO deleta localmente se a API falhar
      }
    }
    // Fallback: deletar apenas localmente (somente se não está usando API)
    console.log('💾 Deletando apenas localmente (modo offline)')
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

  const updateBeneficiario = async (id, beneficiarioAtualizado) => {
    console.log('✏️ Atualizando beneficiário ID:', id, '| useAPI:', useAPI)
    if (useAPI) {
      try {
        console.log('📡 Chamando API PUT /beneficiarios/' + id)
        await apiRequest(`/beneficiarios/${id}`, {
          method: 'PUT',
          body: JSON.stringify(beneficiarioAtualizado)
        })
        console.log('✅ Beneficiário atualizado com sucesso na API')
        await loadData()
        return
      } catch (error) {
        console.error('❌ Erro ao atualizar beneficiário na API:', error)
        alert('Erro ao atualizar: ' + error.message + '\nAs alterações não foram salvas no banco de dados.')
        return // NÃO atualiza localmente se a API falhar
      }
    }
    // Fallback: atualizar apenas localmente (somente se não está usando API)
    console.log('💾 Atualizando apenas localmente (modo offline)')
    setBeneficiarios(beneficiarios.map(b => b.id === id ? { ...b, ...beneficiarioAtualizado } : b))
  }

  const deleteBeneficiario = async (id) => {
    console.log('🗑️ Deletando beneficiário ID:', id, '| useAPI:', useAPI)
    if (useAPI) {
      try {
        console.log('📡 Chamando API DELETE /beneficiarios/' + id)
        await apiRequest(`/beneficiarios/${id}`, { method: 'DELETE' })
        console.log('✅ Beneficiário deletado com sucesso na API')
        await loadData()
        return
      } catch (error) {
        console.error('❌ Erro ao deletar beneficiário na API:', error)
        console.error('⚠️ ATENÇÃO: Não foi possível deletar no backend!')
        alert('Erro ao deletar: ' + error.message + '\nO item não foi removido do banco de dados.')
        return // NÃO deleta localmente se a API falhar
      }
    }
    // Fallback: deletar apenas localmente (somente se não está usando API)
    console.log('💾 Deletando apenas localmente (modo offline)')
    setBeneficiarios(beneficiarios.filter(b => b.id !== id))
  }

  // Distribuição
  const addDistribuicao = async (distribuicao) => {
    console.log('📦 Registrando distribuição para:', distribuicao.beneficiarioNome, '| useAPI:', useAPI)
    console.log('   Produtos:', distribuicao.produtos.length)
    
    if (useAPI) {
      try {
        // Criar uma doação enviada para cada produto da distribuição
        console.log('📡 Criando doações enviadas no backend...')
        
        for (const produto of distribuicao.produtos) {
          const produtoEstoque = produtos.find(p => p.id === produto.id)
          if (!produtoEstoque) {
            throw new Error(`Produto ${produto.nome} não encontrado`)
          }

          console.log(`  ➡️ Registrando: ${produto.quantidade}x ${produto.nome}`)
          
          await apiRequest('/doacoes/enviadas', {
            method: 'POST',
            body: JSON.stringify({
              quantidade: produto.quantidade,
              beneficiarioId: distribuicao.beneficiarioId,
              tipoId: produtoEstoque.tipoId,
              estoqueId: produtoEstoque.id
            })
          })
        }

        console.log('✅ Distribuição registrada com sucesso!')
        console.log('   Recarregando dados do servidor...')
        await loadData()
        return
      } catch (error) {
        console.error('❌ Erro ao registrar distribuição:', error)
        alert('Erro ao registrar distribuição: ' + error.message + '\nA distribuição não foi salva no banco de dados.')
        throw error
      }
    }

    // Fallback: modo offline
    console.log('💾 Registrando distribuição localmente (modo offline)')
    const newDistribuicao = {
      ...distribuicao,
      id: Math.max(...distribuicoes.map(d => d.id), 0) + 1,
      data: new Date(),
      responsavel: user?.nome || 'Admin'
    }

    // Atualizar estoque localmente
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
