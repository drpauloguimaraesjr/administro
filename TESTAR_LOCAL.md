# 🧪 Testar Localmente Primeiro

## ✅ Passo 1: Copiar pasta shared (se ainda não foi)

```bash
cd "/Users/drpgjr.../administrador de contas"
cp -r shared backend/shared
```

## ✅ Passo 2: Instalar dependências

```bash
cd backend
npm install
```

## ✅ Passo 3: Criar arquivo .env local

Copie o arquivo `.env.example` ou crie um `.env` com as variáveis necessárias.

```bash
# No diretório backend/
cp .env.example .env
```

Ou crie manualmente:

```bash
# backend/.env
NODE_ENV=development
PORT=3001
FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
WHATSAPP_WHITELIST=
WHATSAPP_AUTO_START=false
N8N_WEBHOOK_URL=
BACKEND_WEBHOOK_URL=
```

## ✅ Passo 4: Testar compilação TypeScript

```bash
cd backend
npm run build
```

**Se der erro aqui, corrigimos ANTES de fazer deploy!**

## ✅ Passo 5: Rodar localmente

```bash
cd backend
npm run dev
```

Ou se preferir compilar e rodar:

```bash
npm run build
npm start
```

## ✅ Passo 6: Testar endpoints

Com o servidor rodando, teste:

```bash
# Health check
curl http://localhost:3001/health

# Deve retornar: {"status":"ok","timestamp":"..."}
```

## 🔍 Se der erro

Envie o erro completo que eu ajudo a corrigir!

## 📝 Depois que funcionar localmente

Aí sim fazemos commit e push para o Railway!

