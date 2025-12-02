const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email, senha) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  verify: () => request('/auth/verify'),

  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Beneficiários API
export const beneficiariosAPI = {
  getAll: () => request('/beneficiarios'),

  getById: (id) => request(`/beneficiarios/${id}`),

  create: (data) => request('/beneficiarios', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => request(`/beneficiarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => request(`/beneficiarios/${id}`, { method: 'DELETE' }),
};

// Estoque/Produtos API
export const estoqueAPI = {
  getAll: () => request('/estoque'),

  getById: (id) => request(`/estoque/${id}`),

  getLowStock: (limite = 10) => request(`/estoque/baixo?limite=${limite}`),

  create: (data) => request('/estoque', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => request(`/estoque/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => request(`/estoque/${id}`, { method: 'DELETE' }),
};

// Tipos API
export const tiposAPI = {
  getAll: () => request('/tipos'),

  getById: (id) => request(`/tipos/${id}`),

  create: (data) => request('/tipos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => request(`/tipos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => request(`/tipos/${id}`, { method: 'DELETE' }),
};

// Doações Recebidas API
export const doacoesRecebidasAPI = {
  getAll: () => request('/doacoes/recebidas'),

  getById: (id) => request(`/doacoes/recebidas/${id}`),

  create: (data) => request('/doacoes/recebidas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id) => request(`/doacoes/recebidas/${id}`, { method: 'DELETE' }),
};

// Doações Enviadas API
export const doacoesEnviadasAPI = {
  getAll: () => request('/doacoes/enviadas'),

  getById: (id) => request(`/doacoes/enviadas/${id}`),

  getByBeneficiario: (beneficiarioId) => request(`/doacoes/enviadas/beneficiario/${beneficiarioId}`),

  create: (data) => request('/doacoes/enviadas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id) => request(`/doacoes/enviadas/${id}`, { method: 'DELETE' }),
};

// Operadores API
export const operadoresAPI = {
  getAll: () => request('/operadores'),

  getById: (id) => request(`/operadores/${id}`),

  create: (data) => request('/operadores', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => request(`/operadores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updatePassword: (id, novaSenha) => request(`/operadores/${id}/senha`, {
    method: 'PUT',
    body: JSON.stringify({ novaSenha }),
  }),

  delete: (id) => request(`/operadores/${id}`, { method: 'DELETE' }),
};

// Relatórios API
export const relatoriosAPI = {
  dashboard: () => request('/relatorios/dashboard'),

  porPeriodo: (params) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/relatorios/periodo?${queryParams}`);
  },

  porBeneficiario: (beneficiarioId) => request(`/relatorios/beneficiario/${beneficiarioId}`),

  distribuicaoMensal: () => request('/relatorios/mensal'),
};

export default {
  auth: authAPI,
  beneficiarios: beneficiariosAPI,
  estoque: estoqueAPI,
  tipos: tiposAPI,
  operadores: operadoresAPI,
  doacoesRecebidas: doacoesRecebidasAPI,
  doacoesEnviadas: doacoesEnviadasAPI,
  relatorios: relatoriosAPI,
};

