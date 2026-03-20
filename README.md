# Guia de Desenvolvimento — Etiquetas & Grupos e Servicos

Guia para rodar as apps **app-etiquetas-vite** e **app-gruposeservicos-vite** em modo desenvolvimento.

---

## Pre-requisitos

```bash
# Node 18+ e pnpm instalados
node --version    # deve ser >= 18
pnpm --version    # deve estar instalado
```

Se nao tiver o pnpm:
```bash
npm install -g pnpm
```

---

## 1. Clonar e instalar

```bash
cd ~/www-2026-fev/proj-micro-sankhya

# Instalar dependencias de cada app
cd app-etiquetas-vite && pnpm install && cd ..
cd app-gruposeservicos-vite && pnpm install && cd ..
cd api-micro-sankhya && pnpm install && cd ..
```

---

## 2. Variaveis de ambiente (.env)

### API (api-micro-sankhya)

A API ja esta configurada no servidor. Em dev local, ela roda na porta **3000**.

### app-etiquetas-vite

Criar o arquivo `.env` na raiz da app:

```bash
cd app-etiquetas-vite
```

**.env**
```env
VITE_API_URL=http://localhost:3000
VITE_PUBLIC_URL=https://publico.gigantao.net
```

| Variavel         | O que e                                        | Valor em dev              |
|------------------|------------------------------------------------|---------------------------|
| `VITE_API_URL`   | URL da API backend                             | `http://localhost:3000`   |
| `VITE_PUBLIC_URL`| URL do app publico (QR codes dos armarios)     | `https://publico.gigantao.net` |

### app-gruposeservicos-vite

Esta app **nao precisa de .env obrigatoriamente** — ela descobre a API automaticamente pela URL do navegador (mesmo hostname, porta 3000).

Mas para garantir, pode criar `.env`:

```bash
cd app-gruposeservicos-vite
```

**.env**
```env
VITE_API_URL=http://localhost:3000
```

| Variavel       | O que e            | Valor em dev            |
|----------------|--------------------|-------------------------|
| `VITE_API_URL` | URL da API backend | `http://localhost:3000` |

> **Nota:** Se nao criar .env, a app usa `http://{seu-hostname}:3000` automaticamente.

---

## 3. Iniciar em modo desenvolvimento

### Opcao A — Menu interativo (recomendado)

Na raiz do projeto:

```bash
node dev.mjs
```

Selecionar o preset desejado:
- **API + Etiquetas** — sobe a API (porta 3000) + etiquetas (porta 3003)
- **API + Grupos e Servicos** — sobe a API (porta 3000) + grupos (porta 3011)

### Opcao B — Scripts individuais

Abrir **2 terminais**:

```bash
# Terminal 1: API
./start-api.sh

# Terminal 2: App desejada
./start-etiquetas.sh          # porta 3003
# ou
./start-gruposeservicos.sh    # porta 3011
```

### Opcao C — Manual (pnpm dev)

```bash
# Terminal 1: API
cd api-micro-sankhya
pnpm dev

# Terminal 2: App
cd app-etiquetas-vite
pnpm dev
# ou
cd app-gruposeservicos-vite
pnpm dev
```

---

## 4. Acessar no navegador

| App                  | URL em dev                    | Porta |
|----------------------|-------------------------------|-------|
| API (backend)        | http://localhost:3000          | 3000  |
| Etiquetas            | http://localhost:3003          | 3003  |
| Grupos e Servicos    | http://localhost:3011          | 3011  |
| Health check da API  | http://localhost:3000/health   | 3000  |

Ao abrir a app no navegador, voce vera a tela de login.

---

## 5. Login

### Dados para login em dev

| Campo    | Valor                  |
|----------|------------------------|
| Tipo     | Usuario padrao         |
| Database | **TESTE** (importante) |

> **IMPORTANTE:** Sempre usar database **TESTE** em desenvolvimento. Nunca PROD.

### Sobre o login

- Existem 2 tipos de login: **Usuario padrao** (usuario/senha) e **Colaborador** (codparc/CPF)
- Apos login, o token JWT e salvo no localStorage
- Se pedir codigo TOTP (2FA), informar o codigo do autenticador

---

## 6. Portas e servicos

| Servico              | Porta dev | Porta prod | Dominio producao               |
|----------------------|-----------|------------|--------------------------------|
| API                  | 3000      | 7100       | api-micro-sankhya.gigantao.net |
| Etiquetas            | 3003      | 7102       | etiquetas.gigantao.net         |
| Grupos e Servicos    | 3011      | 7111       | gruposeservicos.gigantao.net   |

---

## 7. Estrutura das apps

Ambas as apps seguem a mesma estrutura:

```
src/
├── main.tsx              # Ponto de entrada
├── app/
│   ├── app-provider.tsx  # Providers globais (tema, react-query)
│   └── router.tsx        # Rotas da app
├── api/
│   ├── client.ts         # Axios configurado (token, headers)
│   └── auth.ts           # Endpoints de login
├── components/
│   ├── layout/           # Shell, header, menu
│   └── login/            # Tela de login
├── pages/                # Paginas da app
├── stores/               # Estado global (Zustand)
├── hooks/                # Custom hooks
├── types/                # Interfaces TypeScript
└── theme/                # Tema MUI
```

### Tecnologias usadas

| Tecnologia          | Para que serve                          |
|---------------------|-----------------------------------------|
| React 19            | Framework UI                            |
| Vite                | Dev server e build                      |
| TypeScript          | Tipagem                                 |
| MUI (Material UI) 7 | Componentes visuais                    |
| TanStack Query      | Cache e fetch de dados da API           |
| Zustand             | Estado global (auth, tema)              |
| Axios               | Requisicoes HTTP                        |
| React Router 7      | Navegacao entre paginas                 |

---

## 8. Rotas de cada app

### Etiquetas

| Rota       | Pagina                        |
|------------|-------------------------------|
| `/login`   | Login                         |
| `/`        | Home                          |
| `/armarios`| Lista de armarios (etiquetas) |

### Grupos e Servicos

| Rota                 | Pagina                           |
|----------------------|----------------------------------|
| `/login`             | Login                            |
| `/dashboard`         | Dashboard principal              |
| `/arvore`            | Arvore hierarquica               |
| `/servicos`          | Lista de servicos                |
| `/nao-utilizados`    | Grupos nao utilizados            |
| `/estudo`            | Estudo/analise                   |
| `/gerenciar`         | CRUD de grupos e servicos        |
| `/grupo/:codGrupo`   | Detalhe de um grupo              |

---

## 9. Proxy da API (como funciona)

### Etiquetas
O `vite.config.ts` tem um proxy configurado:
- Chamadas para `/api/*` sao redirecionadas para `http://localhost:3000`
- O prefixo `/api` e removido automaticamente
- Isso evita problemas de CORS em dev

### Grupos e Servicos
**Nao usa proxy.** Chama a API diretamente pela URL do `.env` ou pela URL derivada do hostname do navegador.

---

## 10. Dicas

- **Nao usar PROD** — sempre selecionar database TESTE no login
- **Hot reload** — ao salvar um arquivo, o Vite atualiza automaticamente no navegador
- **Imports com @/** — use `@/components/...` em vez de caminhos relativos (`../../`)
- **API fora do ar?** — verificar se o terminal da API esta rodando sem erros
- **Porta ocupada?** — matar o processo: `lsof -i :3003` e `kill -9 <PID>`
- **Limpar cache do navegador** — se login travar: abrir DevTools > Application > localStorage > limpar

---

## 11. Build (para producao)

Nao e necessario em dev, mas para referencia:

```bash
cd app-etiquetas-vite
pnpm build          # gera pasta dist/

cd app-gruposeservicos-vite
pnpm build          # gera pasta dist/
```

> **NUNCA fazer deploy para producao sem pedir ao responsavel.** Build local e apenas para teste.
