import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Produtos } from './pages/Produtos'
import { Beneficiarios } from './pages/Beneficiarios'
import { Operadores } from './pages/Operadores'
import { Distribuicao } from './pages/Distribuicao'
import { Historico } from './pages/Historico'
import { Relatorios } from './pages/Relatorios'

// Componente de rota protegida (requer login)
function ProtectedRoute({ children }) {
  const { user } = useApp()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Componente de rota protegida APENAS para Admin
function AdminRoute({ children }) {
  const { user } = useApp()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Tipo 1 = Admin, Tipo 0 = Operador
  const isAdmin = user.tipo === 1 || user.tipo === '1'
  
  if (!isAdmin) {
    console.log('⚠️ Acesso negado: Operador tentou acessar rota de Admin')
    alert('⚠️ Acesso Restrito!\n\nVocê não tem permissão para acessar esta página.')
    return <Navigate to="/produtos" replace />
  }

  return children
}

// Componente de rota pública (redireciona se já estiver logado)
function PublicRoute({ children }) {
  const { user } = useApp()

  if (user) {
    // Redirecionar baseado no tipo de usuário
    // Tipo 1 = Admin, Tipo 0 = Operador
    const isAdmin = user.tipo === 1 || user.tipo === '1'
    const redirectTo = isAdmin ? '/dashboard' : '/produtos'
    return <Navigate to={redirectTo} replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {/* Rotas APENAS para Admin */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/operadores"
        element={
          <AdminRoute>
            <Operadores />
          </AdminRoute>
        }
      />
      <Route
        path="/historico"
        element={
          <AdminRoute>
            <Historico />
          </AdminRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <AdminRoute>
            <Relatorios />
          </AdminRoute>
        }
      />

      {/* Rotas para Admin E Operador */}
      <Route
        path="/produtos"
        element={
          <ProtectedRoute>
            <Produtos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/beneficiarios"
        element={
          <ProtectedRoute>
            <Beneficiarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distribuicao"
        element={
          <ProtectedRoute>
            <Distribuicao />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
