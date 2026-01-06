# ⚡ n8n no Railway - Guia Rápido (5 minutos)

## 🚀 Setup Rápido

### 1. Criar Serviço n8n

1. Railway Dashboard → **New** → **Deploy Template**
2. Procure **"n8n"** → Clique **"Deploy"**
3. ✅ Pronto! O Railway cria tudo automaticamente

### 2. Configurar Variáveis (Railway → Variables)

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=sua_senha_super_segura
N8N_HOST=seu-n8n.up.railway.app
N8N_PROTOCOL=https
WEBHOOK_URL=https://seu-n8n.up.railway.app/
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

### 3. Gerar Domínio

1. Railway → **Networking** → **Generate Domain**
2. Copie a URL
3. Atualize `N8N_HOST` e `WEBHOOK_URL` com essa URL

### 4. Acessar n8n

1. Acesse a URL gerada
2. Login: `admin` / senha que você configurou

### 5. Importar Workflow

1. n8n → **Workflows** → **Import from File**
2. Selecione `n8n-workflow.json`
3. Configure OpenAI (se usar versão completa)
4. Ative o webhook (Execute Node)
5. Copie a URL do webhook

### 6. Configurar Backend

No backend (Railway → Variables):

```env
N8N_WEBHOOK_URL=https://seu-n8n.up.railway.app/webhook/receive-media
```

### 7. Ativar Workflow

1. No n8n, clique no **toggle** do workflow para ativar
2. ✅ Pronto!

---

**Teste:** Envie uma imagem via WhatsApp! 📱

---

Veja `N8N_RAILWAY_SETUP.md` para detalhes completos.

