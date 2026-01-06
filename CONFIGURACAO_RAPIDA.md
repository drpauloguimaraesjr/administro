# ⚡ Configuração Rápida de Variáveis

## 📍 Onde Configurar Cada Variável

### 🟢 FRONTEND (Next.js)

#### Desenvolvimento Local
**Arquivo:** `frontend/.env.local`

```bash
# Copie o arquivo FRONTEND_ENV_LOCAL.env
cp FRONTEND_ENV_LOCAL.env frontend/.env.local
```

#### Produção (Vercel)
**Onde:** Vercel → Settings → Environment Variables

**Arquivo de referência:** `VERCEL_ENV_VARS.txt`

**Variáveis necessárias:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL` (URL do Railway)

---

### 🔵 BACKEND (Node.js/Express)

#### Desenvolvimento Local
**Arquivo:** `backend/.env`

```bash
# Copie o arquivo BACKEND_ENV_LOCAL.env
cp BACKEND_ENV_LOCAL.env backend/.env
```

#### Produção (Railway)
**Onde:** Railway → Variables → Raw Editor (ENV tab)

**Arquivo de referência:** `RAILWAY_RAW_EDITOR.env`

**Variáveis necessárias:**
- `NODE_ENV=production`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_SERVICE_ACCOUNT` (JSON completo em uma linha)
- `WHATSAPP_WHITELIST` (números separados por vírgula)
- `WHATSAPP_AUTO_START=true`
- `N8N_WEBHOOK_URL` (opcional, FASE 3)
- `BACKEND_WEBHOOK_URL` (opcional, FASE 3)

---

## 🎯 Passo a Passo Rápido

### 1️⃣ Frontend Local

```bash
cd frontend
cp ../FRONTEND_ENV_LOCAL.env .env.local
# Edite .env.local se necessário
```

### 2️⃣ Backend Local

```bash
cd backend
cp ../BACKEND_ENV_LOCAL.env .env
# Edite .env se necessário
```

### 3️⃣ Vercel (Frontend)

1. Acesse: [vercel.com](https://vercel.com) → Seu Projeto
2. Vá em: **Settings** → **Environment Variables**
3. Abra o arquivo: `VERCEL_ENV_VARS.txt`
4. Adicione cada variável uma por uma
5. **IMPORTANTE:** Marque **Production**, **Preview** e **Development**

### 4️⃣ Railway (Backend)

1. Acesse: [railway.app](https://railway.app) → Seu Projeto
2. Vá em: **Variables** → **Raw Editor** (aba ENV)
3. Abra o arquivo: `RAILWAY_RAW_EDITOR.env`
4. Copie TODO o conteúdo
5. Cole no Raw Editor
6. Clique em **Save**

---

## 📋 Checklist

### Frontend
- [ ] Criado `frontend/.env.local` (desenvolvimento)
- [ ] Configurado no Vercel (produção)
- [ ] Todas as variáveis `NEXT_PUBLIC_*` configuradas
- [ ] `NEXT_PUBLIC_BACKEND_URL` aponta para Railway em produção

### Backend
- [ ] Criado `backend/.env` (desenvolvimento)
- [ ] Configurado no Railway (produção)
- [ ] `FIREBASE_SERVICE_ACCOUNT` em uma linha no Railway
- [ ] `WHATSAPP_WHITELIST` configurado (se necessário)
- [ ] `WHATSAPP_AUTO_START=true` configurado

---

## 📚 Documentação Completa

Para detalhes completos, veja: **`VARIAVEIS_AMBIENTE.md`**

