# 🔍 LinkedIn Jobs API

> API REST para busca de vagas no LinkedIn — construída com Fastify, Playwright, PostgreSQL e Redis.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?style=flat-square&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.x-2EAD33?style=flat-square&logo=playwright&logoColor=white)

---

## ⚠️ Aviso

Este projeto utiliza web scraping e é destinado **exclusivamente para fins educacionais e de estudo**. O uso de scraping pode violar os [Termos de Serviço do LinkedIn](https://www.linkedin.com/legal/user-agreement). Use com responsabilidade.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Rodando o Projeto](#rodando-o-projeto)
- [Rotas da API](#rotas-da-api)
- [Testes](#testes)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Contribuindo](#contribuindo)

---

## Visão Geral

API que permite buscar, filtrar e armazenar vagas de emprego do LinkedIn. Utiliza Playwright para scraping, cache com Redis para evitar buscas repetidas, e PostgreSQL para persistência de dados e autenticação de usuários.

**Principais funcionalidades:**
- Autenticação com JWT
- Busca de vagas por palavra-chave, localização e filtros
- Cache automático de resultados (TTL de 30 minutos)
- Histórico de buscas por usuário
- Rate limiting por IP e por usuário

---

## Arquitetura

```
Client → Fastify API → Scraper (Playwright) → LinkedIn
                ↕               ↕
           PostgreSQL         Redis
```

| Camada       | Tecnologia              | Função                          |
|--------------|-------------------------|---------------------------------|
| API          | Fastify + TypeScript    | Roteamento, auth, validação     |
| Scraping     | Playwright              | Coleta de vagas no LinkedIn     |
| Cache        | Redis                   | Cache de buscas (TTL 30 min)    |
| Banco        | PostgreSQL + Prisma     | Usuários e histórico            |
| Testes       | Vitest                  | Unit e E2E                      |

---

## Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) >= 22.x
- [PostgreSQL](https://www.postgresql.org/download/) >= 16
- [Redis](https://redis.io/docs/install/) >= 7
- npm >= 10

### Instalando PostgreSQL (local)

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Baixe o instalador em [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

### Instalando Redis (local)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Use o [WSL2](https://redis.io/docs/install/install-redis/install-redis-on-windows/) ou [Redis for Windows](https://github.com/microsoftarchive/redis/releases).

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/linkedin-jobs-api.git
cd linkedin-jobs-api

# Instale as dependências
npm install

# Instale os browsers do Playwright
npx playwright install chromium
```

---

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

**.env.example:**
```env
# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

# PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/linkedin_jobs"

# Redis
REDIS_URL=redis://localhost:6379

# Scraper
SCRAPER_HEADLESS=true
SCRAPER_TIMEOUT=30000
```

### Criando o banco de dados

```bash
# Cria o banco no PostgreSQL
createdb linkedin_jobs

# Roda as migrations com Prisma
npx prisma migrate dev
```

---

## Rodando o Projeto

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build de produção
npm run build

# Produção
npm start
```

A API estará disponível em `http://localhost:3000`.

---

## Rotas da API

### Autenticação

| Método | Rota             | Descrição              | Auth |
|--------|------------------|------------------------|------|
| POST   | `/auth/register` | Criar conta            | ❌   |
| POST   | `/auth/login`    | Login e obter JWT      | ❌   |
| GET    | `/auth/me`       | Dados do usuário atual | ✅   |

### Vagas

| Método | Rota              | Descrição                        | Auth |
|--------|-------------------|----------------------------------|------|
| GET    | `/jobs/search`    | Buscar vagas no LinkedIn         | ✅   |
| GET    | `/jobs/:id`       | Detalhes de uma vaga             | ✅   |
| GET    | `/jobs/history`   | Histórico de buscas do usuário   | ✅   |

#### Exemplo de busca

```
GET /jobs/search?keyword=backend&location=São Paulo&remote=true&limit=20
```

**Query params disponíveis:**

| Parâmetro  | Tipo    | Descrição                                 |
|------------|---------|-------------------------------------------|
| `keyword`  | string  | Cargo ou tecnologia (ex: `node developer`)|
| `location` | string  | Cidade ou país                            |
| `remote`   | boolean | Apenas vagas remotas                      |
| `limit`    | number  | Quantidade de resultados (padrão: 10)     |

**Resposta:**
```json
{
  "cached": false,
  "total": 20,
  "jobs": [
    {
      "id": "3942849234",
      "title": "Backend Developer (Node.js)",
      "company": "Empresa XPTO",
      "location": "São Paulo, SP",
      "remote": true,
      "url": "https://www.linkedin.com/jobs/view/3942849234",
      "postedAt": "2025-03-01T10:00:00.000Z"
    }
  ]
}
```

---

## Testes

```bash
# Todos os testes
npm test

# Com cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

---

## Estrutura de Pastas

```
linkedin-jobs-api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts
│   │   ├── jobs/
│   │   │   ├── jobs.routes.ts
│   │   │   ├── jobs.service.ts
│   │   │   └── jobs.schema.ts
│   │   └── scraper/
│   │       ├── scraper.service.ts
│   │       └── scraper.parser.ts
│   ├── plugins/
│   │   ├── jwt.ts
│   │   ├── redis.ts
│   │   └── rate-limit.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── server.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Contribuindo

1. Fork o projeto
2. Crie sua branch: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
