# SANEM - Sistema de Gestão de Doações

Sistema web para gestão de doação e distribuição de produtos para a instituição de caridade SANEM.

## Sobre o Projeto

O Sistema SANEM foi desenvolvido como parte da disciplina de Oficina de Computação para a Comunidade (COM1029-2025/2). O objetivo é criar uma aplicação confiável, escalável e viável para gerenciar o estoque de doações da instituição SANEM.

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MySQL
- JWT (JSON Web Tokens)

### Frontend
- React 18
- Vite
- TailwindCSS
- shadcn/ui
- React Router

## Estrutura do Projeto

```
SANEM/
├── backend/                    # API REST Node.js/Express
│   ├── src/
│   │   ├── config/             # Configuração do banco de dados
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── middlewares/        # Autenticação JWT
│   │   ├── models/             # Modelos de dados
│   │   └── routes/             # Rotas da API
│   └── package.json
├── frontend/                   # Interface React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── context/            # Gerenciamento de estado
│   │   ├── pages/              # Páginas da aplicação
│   │   └── services/           # Chamadas à API
│   └── package.json
├── database/
│   └── schema.sql              # Script de criação do banco
└── docs/                       # Documentação adicional
```

## Pré-requisitos

- Node.js 18 ou superior
- MySQL 8.0 ou superior
- npm ou yarn

## Instalação

### 1. Configurar o Banco de Dados

```bash
# Acessar o MySQL
mysql -u root -p

# Executar o script de criação
source database/schema.sql
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de configuração
copy env.example.txt .env

# Editar o arquivo .env com suas credenciais do MySQL
```

### 3. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de configuração
copy env.example.txt .env
```

## Executando o Projeto

### Backend

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Credenciais Padrão

- Email: `admin@sanem.org`
- Senha: `admin123`

## Funcionalidades

- Autenticação de usuários (Login/Logout)
- Cadastro e gestão de beneficiários
- Controle de estoque de doações
- Registro de doações recebidas
- Distribuição de doações aos beneficiários
- Relatórios e estatísticas
- Dashboard com visão geral

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/login | Autenticação |
| GET | /api/beneficiarios | Listar beneficiários |
| POST | /api/beneficiarios | Cadastrar beneficiário |
| GET | /api/estoque | Listar estoque |
| POST | /api/doacoes/recebidas | Registrar doação recebida |
| POST | /api/doacoes/enviadas | Registrar distribuição |
| GET | /api/relatorios/dashboard | Estatísticas gerais |

## Autores

- Bruno Moura Mathias Fernandes Simão
- Gabriel Vieira Moreno
- João Pedro Domingues
- Natan Pereira Santos

## Licença

Este projeto foi desenvolvido para fins educacionais como parte do curso de Computação.

