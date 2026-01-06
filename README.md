# Sistema Financeiro Híbrido (Pessoal/Clínica) com WhatsApp Automation

Sistema completo de gestão financeira que permite gerenciar transações pessoais e empresariais (clínica) com automação via WhatsApp para upload de comprovantes.

## 🏗️ Arquitetura

- **Frontend**: Next.js 14+ (App Router) hospedado no Vercel
- **Backend**: Node.js + Express hospedado no Railway
- **Database**: Firebase Firestore
- **Automação**: n8n (self-hosted no Railway via Docker)
- **WhatsApp**: Baileys (@whiskeysockets/baileys)

## 📁 Estrutura do Projeto

```
.
├── frontend/          # Next.js App Router
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── backend/           # Node.js + Express + Baileys
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   └── services/
│   └── ...
├── shared/            # Tipos TypeScript compartilhados
│   └── types/
└── README.md
```

## 🚀 Setup Inicial

### 1. Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication, Firestore e Storage
3. Gere uma Service Account Key (Backend)
4. Copie as configurações do projeto (Frontend)

### 2. Configurar Variáveis de Ambiente

#### Frontend (.env.local)
```bash
cp frontend/.env.example frontend/.env.local
# Preencha com suas credenciais do Firebase
```

#### Backend (.env)
```bash
cp backend/.env.example backend/.env
# Preencha com suas credenciais do Firebase e configurações do WhatsApp
```

### 3. Instalar Dependências

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

## 🎯 Funcionalidades (Roadmap)

### ✅ FASE 1: Setup e Configuração (Completo)
- [x] Estrutura de repositório
- [x] Tipos TypeScript compartilhados
- [x] Configuração Firebase (Frontend e Backend)
- [x] Configuração de build

### 🔄 FASE 2: Backend Worker (Pendente)
- [ ] Servidor Express básico
- [ ] Conexão Baileys
- [ ] Listener de mensagens WhatsApp
- [ ] Integração com n8n

### 📋 FASE 3: Endpoints n8n (Pendente)
- [ ] Rota POST /api/n8n/create-transaction
- [ ] Salvamento no Firestore
- [ ] Upload de comprovantes

### 🎨 FASE 4: Frontend Dashboard (Pendente)
- [ ] Context Selector (HOME/CLINIC/OVERVIEW)
- [ ] Lista de transações
- [ ] Filtros e buscas
- [ ] Visualização mobile-first

### 📊 FASE 5: Investimentos e Relatórios (Pendente)
- [ ] Tela de investimentos
- [ ] Gráficos de evolução
- [ ] Parcelas de imóveis

## 🔐 Segurança

- Never commite arquivos `.env` ou `serviceAccountKey.json`
- Use variáveis de ambiente no Railway e Vercel
- Configure whitelist de números no WhatsApp
- Implemente autenticação Firebase no frontend

## 📝 Notas de Desenvolvimento

- O código está organizado de forma modular
- Tipos compartilhados garantem consistência entre frontend e backend
- Mobile-first approach em todas as telas
- Suporte a múltiplos contextos (HOME/CLINIC)

---

Desenvolvido como sistema de gestão financeira híbrido com automação WhatsApp.

