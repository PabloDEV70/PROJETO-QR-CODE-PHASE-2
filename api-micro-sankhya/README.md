# API Micro Sankhya

API RESTful para integração com o sistema Sankhya, consumindo a API Mother e expondo endpoints especializados para gestão de funcionários, RDOs, Ordens de Serviço e veículos.

## 🚀 Quick Start

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar testes de integração
pnpm test:e2e

# Build para produção
pnpm build

# Iniciar servidor
pnpm start
```

## 📋 Índice

- [Arquitetura](docs/ARCHITECTURE.md)
- [Endpoints da API](docs/API.md)
- [Guia de Contribuição](docs/CONTRIBUTING.md)
- [Testes](docs/TESTING.md)
- [Documentação de Tabelas](src/_reference/)

## 🏗️ Arquitetura

```
src/
├── config/           # Configurações (env com Zod)
├── domain/           # Serviços e lógica de negócio
│   └── services/    # Services organizados por domínio
├── infra/           # Infraestrutura HTTP e API Mother
│   ├── api-mother/  # Cliente HTTP para API Mother
│   └── http/        # Fastify routes e plugins
├── shared/          # Utilitários compartilhados
│   ├── constants/  # Constantes globais
│   └── utils/      # Funções helper
├── sql-queries/     # Queries SQL organizadas por tabela
├── types/          # TypeScript interfaces por tabela
└── _reference/     # Documentação de tabelas
```

Ver [Arquitetura Completa](docs/ARCHITECTURE.md)

## 📡 Endpoints Principais

| Módulo | Endpoint | Descrição |
|--------|----------|-----------|
| **RDO** | `GET /rdo` | Lista RDOs com paginação |
| | `GET /rdo/analytics/produtividade` | Relatório de produtividade |
| | `GET /rdo/detalhes` | Detalhes de RDOs |
| **Funcionários** | `GET /funcionarios/:id/perfil-completo` | Perfil completo |
| | `GET /funcionarios/:id/hora-extra` | Horas extras |
| | `GET /funcionarios/parceiro/:id/vinculos` | Vínculos |
| **OS Manutenção** | `GET /man/os` | Ordens de serviço |
| | `GET /man/kpis` | KPIs de manutenção |
| | `GET /man/ativas` | OS ativas |
| **OS Comercial** | `GET /os-comercial` | Ordens comerciais |
| | `GET /os-comercial/stats` | Estatísticas |
| **Veículos** | `GET /veiculos` | Lista veículos |
| | `GET /veiculos/:id/resumo` | Resumo por veículo |
| **Parceiros** | `GET /parceiros` | Lista parceiros |
| | `GET /parceiros/search?q=` | Busca parceiros |

Ver [Documentação de Endpoints](docs/API.md)

## 🧪 Testes

```bash
# Rodar todos os testes E2E
pnpm test:e2e

# Total de testes: 277
```

Ver [Guia de Testes](docs/TESTING.md)

## 📚 Documentação de Tabelas

Cada tabela do banco possui documentação em `src/_reference/{TABELA}/overview.md`:

- [AD_RDOAPONTAMENTOS](src/_reference/AD_RDOAPONTAMENTOS/overview.md)
- [TFPFUN](src/_reference/TFPFUN/overview.md)
- [TGFPAR](src/_reference/TGFPAR/overview.md)
- [TCFOSCAB](src/_reference/TCFOSCAB/overview.md)
- [TGFVEI](src/_reference/TGFVEI/overview.md)
- E mais 20+ tabelas...

## 🔧 Desenvolvimento

### Convenções de Código

- **Indentação**: 2 espaços
- **Linhas por arquivo**: máximo 200
- **Nomeação**: camelCase para variáveis, PascalCase para classes
- **SQL**: Sempre usar `ROW_NUMBER()` para paginação (SQL Server 2005)

### Adicionando Nova Tabela

1. **Investigar** via API Mother
2. **Documentar** em `src/_reference/{TABELA}/overview.md`
3. **Criar tipos** em `src/types/{TABELA}/index.ts`
4. **Criar queries** em `src/sql-queries/{TABELA}/get-*.ts`
5. **Criar service** em `src/domain/services/{nome}.service.ts`
6. **Criar rotas** em `src/infra/http/routes/{nome}.routes.ts`
7. **Criar testes** em `test/integration/{nome}.e2e-spec.ts`

Ver [Guia de Contribuição](docs/CONTRIBUTING.md)

## 📦 Dependências

| Dependência | Versão | Uso |
|-------------|--------|-----|
| Fastify | ^5.7 | Servidor HTTP |
| Axios | ^1.13 | Cliente HTTP |
| Zod | ^4.3 | Validação |
| Pino | ^9.6 | Logging |
| Jest | ^30 | Testes |

## 📄 Licença

ISC
