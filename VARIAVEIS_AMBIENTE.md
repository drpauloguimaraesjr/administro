# 📋 Guia Completo de Variáveis de Ambiente

Este documento explica **onde configurar cada variável** no Frontend (Vercel) e Backend (Railway).

---

## 🎯 BACKEND (Railway / Desenvolvimento Local)

### 📁 Arquivo Local: `backend/.env`

Crie este arquivo na pasta `backend/` com o seguinte conteúdo:

```env
# Ambiente
NODE_ENV=development
PORT=3001

# Firebase Admin SDK
FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"administro-af341","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@administro-af341.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/...","universe_domain":"googleapis.com"}

# WhatsApp (Baileys)
WHATSAPP_WHITELIST=5511999999999,5511888888888
WHATSAPP_AUTO_START=true

# N8N (FASE 3)
N8N_WEBHOOK_URL=
BACKEND_WEBHOOK_URL=
```

### 🚂 Railway (Produção)

**Onde configurar:**
1. Acesse o projeto no Railway
2. Vá em **Variables** (ou **Settings** → **Environment**)
3. Use o **Raw Editor** (ENV tab) para colar tudo de uma vez

**OU** adicione variável por variável na interface.

**Arquivo pronto para copiar:**
Use o arquivo `RAILWAY_RAW_EDITOR.env` que já está no repositório!

**📝 Formato para Railway Raw Editor:**
```env
NODE_ENV=production
FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
WHATSAPP_WHITELIST=5511999999999,5511888888888
WHATSAPP_AUTO_START=true
N8N_WEBHOOK_URL=
BACKEND_WEBHOOK_URL=
```

---

## 🎨 FRONTEND (Vercel / Desenvolvimento Local)

### 📁 Arquivo Local: `frontend/.env.local`

Crie este arquivo na pasta `frontend/` com o seguinte conteúdo:

```env
# Firebase Client SDK (obtenha no Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDKxHxISTitakS8o8sJmebsXpiTRAiqTXo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=administro-af341.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=administro-af341
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=857150753142
NEXT_PUBLIC_FIREBASE_APP_ID=1:857150753142:web:375eea8cb1e8c92b33d257

# URL do Backend (para chamadas API)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### ▲ Vercel (Produção)

**Onde configurar:**
1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável uma por uma

**📝 Variáveis para adicionar no Vercel:**

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDKxHxISTitakS8o8sJmebsXpiTRAiqTXo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = administro-af341.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = administro-af341
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = administro-af341.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 857150753142
NEXT_PUBLIC_FIREBASE_APP_ID = 1:857150753142:web:375eea8cb1e8c92b33d257
NEXT_PUBLIC_BACKEND_URL = https://seu-backend.railway.app
```

**⚠️ IMPORTANTE:** 
- No Vercel, configure para **Production**, **Preview** e **Development**
- Use a URL do backend do Railway em produção: `https://seu-backend.railway.app`
- Use `http://localhost:3001` apenas para desenvolvimento local

---

## 📊 Resumo das Variáveis por Localização

### 🔵 BACKEND (Node.js/Express) - Railway

| Variável | Onde usar | Descrição |
|----------|-----------|-----------|
| `NODE_ENV` | Railway | `production` |
| `PORT` | Railway | Porta (geralmente definida automaticamente) |
| `FIREBASE_STORAGE_BUCKET` | Railway | Bucket do Firebase Storage |
| `FIREBASE_SERVICE_ACCOUNT` | Railway | JSON completo da service account (uma linha) |
| `WHATSAPP_WHITELIST` | Railway | Números autorizados (separados por vírgula) |
| `WHATSAPP_AUTO_START` | Railway | `true` ou `false` |
| `N8N_WEBHOOK_URL` | Railway | URL do webhook do n8n (FASE 3) |
| `BACKEND_WEBHOOK_URL` | Railway | URL do backend para n8n chamar (FASE 3) |

### 🟢 FRONTEND (Next.js) - Vercel

| Variável | Onde usar | Descrição |
|----------|-----------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Vercel | Chave API do Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Vercel | Domínio de autenticação |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Vercel | ID do projeto Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Vercel | Bucket do Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Vercel | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Vercel | App ID do Firebase |
| `NEXT_PUBLIC_BACKEND_URL` | Vercel | URL do backend (Railway) |

---

## 🔧 Como Configurar no Railway (Passo a Passo)

### Método 1: Raw Editor (Recomendado - Mais Rápido)

1. No Railway, vá em **Variables** → **Raw Editor** (ENV tab)
2. Abra o arquivo `RAILWAY_RAW_EDITOR.env` do repositório
3. Copie TODO o conteúdo
4. Cole no Raw Editor
5. Clique em **Save** ou **Update**

### Método 2: Interface (Variável por Variável)

1. No Railway, vá em **Variables**
2. Clique em **+ New Variable**
3. Adicione cada variável:
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - Repita para cada variável

---

## 🔧 Como Configurar no Vercel (Passo a Passo)

1. No Vercel, acesse seu projeto
2. Vá em **Settings** → **Environment Variables**
3. Clique em **Add New**
4. Para cada variável:
   - **Key**: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Value**: `AIzaSyDKxHxISTitakS8o8sJmebsXpiTRAiqTXo`
   - **Environment**: Marque **Production**, **Preview** e **Development**
   - Clique em **Save**
5. Repita para todas as variáveis do frontend

---

## 📝 Exemplo Completo

### `backend/.env` (Desenvolvimento Local)

```env
NODE_ENV=development
PORT=3001
FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"administro-af341",...}
WHATSAPP_WHITELIST=5511999999999
WHATSAPP_AUTO_START=true
```

### `frontend/.env.local` (Desenvolvimento Local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDKxHxISTitakS8o8sJmebsXpiTRAiqTXo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=administro-af341.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=administro-af341
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=857150753142
NEXT_PUBLIC_FIREBASE_APP_ID=1:857150753142:web:375eea8cb1e8c92b33d257
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## ⚠️ Importante

1. **NUNCA** commite arquivos `.env` ou `.env.local` - eles já estão no `.gitignore`
2. **Frontend**: Variáveis devem começar com `NEXT_PUBLIC_` para serem acessíveis no browser
3. **Backend**: Variáveis NÃO devem ter prefixo `NEXT_PUBLIC_`
4. **Railway**: Use o Raw Editor para o JSON do `FIREBASE_SERVICE_ACCOUNT` em uma linha
5. **Vercel**: Configure para todos os ambientes (Production, Preview, Development)

---

## 🔍 Verificando se Funcionou

### Backend
```bash
cd backend
npm run dev
# Deve iniciar sem erros de variáveis
```

### Frontend
```bash
cd frontend
npm run dev
# Deve iniciar sem avisos de variáveis faltando
```

---

## 📚 Referências

- **Firebase Setup**: Veja `FIREBASE_SETUP.md`
- **Deploy**: Veja `DEPLOY.md`
- **Railway Config**: Veja `RAILWAY_ENV_VARS.md`

