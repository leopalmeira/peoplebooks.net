# PeopleBooks.net

> **Real People. Real Stories. Real Connections.**  
> Plataforma de literatura viva que transforma livros de histórias humanas impressos em comunidades digitais conectadas.

---

## 🏛️ Identidade Visual & Diretrizes (V4 Green Premium)

O projeto segue rigorosamente a identidade visual e editorial de `peoplebooks_verde_premium_v4.html`:

- **Verde Esmeralda:** `#087F5B`
- **Verde Principal:** `#059669`
- **Verde Claro:** `#D1FAE5`
- **Verde Profundo:** `#064E3B`
- **Fundo Claro (Textura Papel):** `#F8FAF9`
- **Texto Principal:** `#14241D`
- **Texto Secundário:** `#64748B`
- **Dourado Editorial:** `#C69C42`
- **Tipografia Literária:** Playfair Display / Cormorant Garamond
- **Tipografia Funcional:** Inter / Manrope

---

## 🚀 Arquitetura & Antigravity Kit 2.0

O projeto incorpora os agentes e padrões do **Antigravity Kit 2.0** localizados na pasta `.agents/`:

- **Frontend Specialist (`.agents/agent/frontend-specialist.md`):**
  - Design Commitment Anti-Safe Harbor (sem clichês de SaaS genéricos, sem bento-grids azuis artificiais, sem molduras falsas de celular).
  - Objeto físico do livro destacado em perspectiva 3D realista.
  - Diagramação e visualizador do miolo editorial em duas páginas abertas (`SpreadViewer`).
  - Internacionalização nativa em Inglês (primário) e Português do Brasil (secundário).

- **Backend Specialist (`.agents/agent/backend-specialist.md`):**
  - Arquitetura em camadas desacopladas: Controllers → Services → Repositories/Database → Providers.
  - Validação rigorosa de esquemas na borda da API com **Zod**.
  - Camada de autenticação segura JWT e autorização RBAC.
  - Proteção estrita contra IDOR e barreira no servidor para mídias privadas.
  - Valores monetários manipulados exclusivamente em números inteiros (centavos/minor units) sem arredondamentos de ponto flutuante.

---

## 📚 Regras de Negócio Inegociáveis

1. **Isolamento de Comunidades por Volume:** O leitor com direito ao Volume 01 **não** acessa conteúdos exclusivos do Volume 02 sem a respectiva ativação.
2. **The Living Diary:** O participante mantém um diário literário vivo. Entradas com visibilidade `volume_readers` exigem autorização confirmada no servidor.
3. **Seguir Participantes:** Seguir um participante exige que o leitor possua direito de acesso ativo ao volume correspondente.
4. **Conversas Privadas:** Uma conversa só se inicia após o envio de uma mensagem de apresentação e aceite voluntário do participante.
5. **QR Code Editorial:** Cada participante possui um QR Code permanente apontando para a sua URL pública (`/people/:slug`). Ele não armazena tokens secretos nem comprova compra de livro.
6. **Verificação de Compra Modular:**
   - `MockVerificationProvider`: Ativação instantânea em desenvolvimento via chave `PB-DEMO-XX` (bloqueado em produção).
   - `ManualVerificationProvider`: Fluxo auditável para conferência de número de pedido da Amazon pela equipe editorial.
   - `AmazonKdpVerificationProvider`: Adaptador com interface preparada, mantido desabilitado por conformidade com a ausência de endpoints públicos da Amazon KDP.

---

## 🛠️ Como Executar Localmente

### 1. Pré-requisitos
- Node.js v20+ ou v24+
- NPM

### 2. Instalação e Execução com Um Comando
Na raiz do projeto (`peoplebooks.net`):

```bash
# Executa servidor e cliente simultaneamente
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

### 3. Contas Pré-configuradas para Testes

O ambiente de desenvolvimento conta com um seletor rápido no topo da página (**Simular Usuário**), ou você pode entrar diretamente com:

| Papel | E-mail | Senha | Acesso |
|---|---|---|---|
| **Leitor** | `leitor@peoplebooks.net` | `reader123` | Volume 01 ativado, segue Juliana Moreira |
| **Autora** | `juliana@peoplebooks.net` | `author123` | Acesso ao Author Studio, Diário Vivo e Saldo |
| **Admin** | `admin@peoplebooks.net` | `admin123` | Painel de Curadoria, Aprovações e Moderação |

---

## 📦 Estrutura de Pastas

```text
peoplebooks.net/
├── .agents/                      # Antigravity Kit 2.0 (Agentes, Regras, Skills)
├── client/                       # Frontend React 19 + TypeScript + Vite + Tailwind
│   ├── public/assets/            # Capas HD, Miolo do livro, Fotos originais
│   ├── src/
│   │   ├── components/           # Book3D, SpreadViewer, QrCodeModal, PaywallCard
│   │   ├── context/              # Auth, Language (i18n), Toast
│   │   ├── pages/                # Home, PeopleCatalog, PersonProfile, Volumes, Studio, Admin
│   │   ├── services/             # Cliente API tipado
│   │   └── types/                # Modelos de domínio TypeScript
├── server/                       # Backend Node.js + Express + TypeScript + Zod
│   ├── src/
│   │   ├── controllers/          # Controladores REST com validação
│   │   ├── middleware/           # Auth JWT, Entitlement Guard, Error Handler
│   │   ├── providers/            # Provedores de Verificação e Pagamentos
│   │   ├── db/                   # Store com persistência local e dados seed
│   │   └── types/                # Interfaces de domínio do servidor
└── supabase/
    └── migrations/
        └── 20261030_initial_schema.sql # 27 tabelas relacionais com RLS e índices
```

---

## 🚢 Deploy no Render

1. **Deploy do Backend (Web Service):**
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Variáveis de ambiente: definir `NODE_ENV=production`, `PORT=3001`, `JWT_SECRET`, e `CORS_ORIGIN`.

2. **Deploy do Frontend (Static Site):**
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Configurar rewrite de SPA: `/*` -> `/index.html`.

