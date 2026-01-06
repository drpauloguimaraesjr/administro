# 🚀 Guia de Setup - FASE 1

Este documento descreve como configurar o projeto após clonar o repositório.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta Firebase criada
- Acesso ao Railway (para backend) e Vercel (para frontend)

## 🔥 Configuração do Firebase

⚠️ **Para um guia detalhado passo a passo**, consulte o arquivo **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** que contém instruções completas com screenshots e troubleshooting.

### Resumo Rápido:

1. Criar projeto no [Firebase Console](https://console.firebase.google.com)
2. Habilitar **Authentication** (Email/Password)
3. Criar **Firestore Database** (modo produção)
4. Habilitar **Storage**
5. Obter credenciais do Frontend (nas Configurações do Projeto)
6. Gerar Service Account para o Backend

**📖 Consulte `FIREBASE_SETUP.md` para instruções detalhadas.**

## 📁 Configuração de Variáveis de Ambiente

### Frontend (.env.local)

Crie o arquivo `frontend/.env.local` com o seguinte conteúdo:

```env
# Firebase Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Backend (.env)

Crie o arquivo `backend/.env` com o seguinte conteúdo:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Admin Configuration
# Cole o conteúdo completo do JSON da Service Account aqui (em uma linha)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Firebase Storage Bucket
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com

# WhatsApp Configuration (para FASE 2)
WHATSAPP_WHITELIST=5511999999999@c.us,5511888888888@c.us

# n8n Webhook URL (para FASE 3)
N8N_WEBHOOK_URL=https://seu-n8n-instance.com/webhook/receive-media
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

**Nota sobre FIREBASE_SERVICE_ACCOUNT**: 
- Para desenvolvimento local, você pode usar o caminho do arquivo:
  ```env
  FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
  ```
- Para produção (Railway), use a variável `FIREBASE_SERVICE_ACCOUNT` com o JSON completo em uma linha.

## 📦 Instalação de Dependências

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

## ▶️ Executar em Desenvolvimento

### Frontend

```bash
cd frontend
npm run dev
```

Acesse: http://localhost:3000

### Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em: http://localhost:3001

## ✅ Verificação

Após configurar tudo:

1. **Frontend**: Acesse http://localhost:3000 - deve mostrar a página inicial
2. **Backend**: Acesse http://localhost:3001/health - deve retornar `{"status":"ok"}`

## 🔐 Segurança

⚠️ **NUNCA** commite:
- Arquivos `.env` ou `.env.local`
- Arquivos `serviceAccountKey.json`
- Qualquer arquivo com credenciais

Estes arquivos já estão no `.gitignore`, mas sempre verifique antes de fazer commit.

## 📝 Próximos Passos

Após completar a FASE 1, você pode prosseguir para:

- **FASE 2**: Implementar o Backend Worker com Baileys
- **FASE 3**: Criar endpoints de recepção do n8n
- **FASE 4**: Desenvolver o Dashboard Frontend
- **FASE 5**: Adicionar Investimentos e Relatórios

---

Dúvidas? Consulte o `README.md` principal para mais informações sobre a arquitetura.

