# 🚀 Guia de Deploy - Vercel + Railway

Este guia explica como fazer o deploy do sistema no Vercel (Frontend) e Railway (Backend).

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Conta no [Railway](https://railway.app)
- Repositório GitHub criado e código commitado
- **⚠️ IMPORTANTE**: Projeto Firebase configurado (consulte [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) se ainda não configurou)

## 🔵 Frontend - Deploy no Vercel

### 1. Conectar Repositório

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Add New Project**
3. Importe o repositório GitHub
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (já está configurado)
   - **Output Directory**: `.next` (já está configurado)

### 2. Configurar Variáveis de Ambiente

No painel do projeto Vercel, vá em **Settings** > **Environment Variables** e adicione:

```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_BACKEND_URL=https://seu-backend.railway.app
```

⚠️ **IMPORTANTE**: Substitua `https://seu-backend.railway.app` pela URL real do seu backend no Railway (você obterá após fazer o deploy no Railway).

### 3. Deploy

1. Clique em **Deploy**
2. Aguarde o build e deploy completarem
3. O Vercel fornecerá uma URL (ex: `seu-projeto.vercel.app`)

## 🚂 Backend - Deploy no Railway

### ⚠️ IMPORTANTE: Configurar Root Directory

**ANTES de fazer deploy**, você precisa configurar o **Root Directory** no Railway:

1. No Railway Dashboard, vá em seu projeto
2. Clique no serviço do backend
3. Vá em **Settings** → **Service Settings**
4. Configure **Root Directory** para: `backend`
5. Salve

**OU** use os arquivos `railway.json` e `nixpacks.toml` na raiz que já estão configurados para apontar para o backend automaticamente.

Sem isso, o Railway não vai encontrar o `package.json` e vai dar erro: `✖ Railpack could not determine how to build the app.`

---

### 1. Criar Novo Projeto

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em **New Project**
3. Selecione **Deploy from GitHub repo**
4. Escolha o repositório
5. Railway detectará automaticamente a pasta `backend`

### 2. Configurar Build Settings

Railway deve detectar automaticamente:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

Se não detectar, configure manualmente nas **Settings**.

### 3. Configurar Variáveis de Ambiente

No painel do projeto Railway, vá em **Variables** e adicione:

```
PORT=3001
NODE_ENV=production

# Firebase Admin (cole o JSON completo em uma linha)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com

# WhatsApp (será usado na FASE 2)
WHATSAPP_WHITELIST=5511999999999@c.us

# n8n (será usado na FASE 3)
N8N_WEBHOOK_URL=https://seu-n8n-instance.com/webhook/receive-media
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

**Dica**: Para o `FIREBASE_SERVICE_ACCOUNT`, copie o conteúdo completo do arquivo JSON da service account e cole como uma única linha. Use `\n` para quebras de linha dentro das strings.

### 4. Obter URL do Backend

1. Após o deploy, Railway fornecerá uma URL
2. Clique no serviço > **Settings** > **Generate Domain**
3. Copie a URL (ex: `seu-backend.railway.app`)
4. **IMPORTANTE**: Volte ao Vercel e atualize a variável `NEXT_PUBLIC_BACKEND_URL` com esta URL

### 5. Configurar Porta

Railway define automaticamente a variável `PORT`, mas certifique-se de que seu código está usando `process.env.PORT || 3001`.

## ✅ Verificação Pós-Deploy

### Frontend (Vercel)
- Acesse a URL fornecida pelo Vercel
- Deve carregar a página inicial
- Verifique o console do navegador por erros

### Backend (Railway)
- Acesse `https://seu-backend.railway.app/health`
- Deve retornar: `{"status":"ok","timestamp":"..."}`

## 🔄 Atualizações Automáticas

Tanto Vercel quanto Railway fazem deploy automático quando você faz push para o repositório GitHub:

- **Vercel**: Deploy automático na branch `main` (ou branch configurada)
- **Railway**: Deploy automático quando detecta mudanças na pasta `backend`

## 🐛 Troubleshooting

### Frontend não conecta ao Backend
- Verifique se `NEXT_PUBLIC_BACKEND_URL` está configurada corretamente no Vercel
- Verifique se o backend está rodando (acesse `/health`)
- Verifique os logs no Railway para erros

### Backend não inicializa Firebase
- Verifique se `FIREBASE_SERVICE_ACCOUNT` está correta
- Verifique se todas as variáveis estão configuradas
- Veja os logs no Railway: `View Logs`

### Build falha
- Verifique os logs de build no Vercel/Railway
- Confirme que todas as dependências estão no `package.json`
- Verifique se os caminhos dos arquivos estão corretos

## 📝 Próximos Passos Após Deploy

1. ✅ Verificar que ambos os serviços estão rodando
2. ✅ Testar conexão frontend ↔ backend
3. ✅ Configurar domínio personalizado (opcional)
4. 🚀 Prosseguir para **FASE 2**: Implementar Baileys e WhatsApp

## 🔐 Segurança em Produção

- ✅ Nunca commite credenciais no código
- ✅ Use apenas variáveis de ambiente
- ✅ Configure CORS no backend se necessário
- ✅ Habilite HTTPS (automático no Vercel/Railway)

---

Dúvidas? Consulte a documentação oficial:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)

