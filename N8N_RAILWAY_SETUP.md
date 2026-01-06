# 🔄 Como Configurar n8n no Railway

Guia completo para fazer deploy do n8n no Railway e integrar com o backend.

## 📋 Pré-requisitos

- Conta no Railway
- Conta no GitHub (se quiser versionar workflows)
- Repositório criado (ou pode usar o Railway sem GitHub)

---

## 🚀 Passo a Passo

### 1. Criar Novo Serviço no Railway

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. No seu projeto, clique em **"New"** → **"Service"**
3. Escolha **"Deploy from Dockerfile"** ou **"Deploy from GitHub repo"**
4. Ou escolha **"Deploy a Template"** → procure por **"n8n"**

### 2. Opção A: Usar Template do n8n (Mais Fácil) ⭐

1. No Railway Dashboard, clique em **"New"** → **"Deploy Template"**
2. Procure por **"n8n"** ou acesse diretamente: https://railway.app/template/n8n
3. Clique em **"Deploy n8n"**
4. O Railway vai criar tudo automaticamente!

### 3. Opção B: Deploy Manual com Docker

Se preferir fazer manualmente, crie um arquivo `Dockerfile`:

```dockerfile
FROM n8nio/n8n:latest

# n8n já está configurado, apenas exponha a porta
EXPOSE 5678
```

E no Railway:
1. **New Service** → **"Deploy from Dockerfile"**
2. Cole o Dockerfile acima
3. Configure a porta: `5678`

### 4. Opção C: Deploy via GitHub

1. Crie um repositório GitHub com um arquivo `docker-compose.yml`:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=${WEBHOOK_URL}
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

2. No Railway: **New Service** → **"Deploy from GitHub repo"**
3. Selecione o repositório

---

## ⚙️ Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```env
# Autenticação Básica (OBRIGATÓRIO para produção)
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=sua_senha_segura_aqui

# URL do n8n (você vai obter após deploy)
N8N_HOST=seu-n8n.railway.app
N8N_PROTOCOL=https

# URL do Webhook (mesma do N8N_HOST)
WEBHOOK_URL=https://seu-n8n.railway.app/

# Timezone
GENERIC_TIMEZONE=America/Sao_Paulo

# Persistência (opcional, mas recomendado)
N8N_USER_FOLDER=/home/node/.n8n

# Variável do Backend (para o workflow chamar)
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

---

## 🌐 Configurar Domínio Público

1. No Railway, vá na aba **"Networking"**
2. Clique em **"Generate Domain"**
3. Copie a URL gerada (ex: `seu-n8n.up.railway.app`)
4. Use essa URL no `N8N_HOST` e `WEBHOOK_URL`

---

## 📦 Importar Workflow

### 1. Acessar n8n

1. Acesse a URL do n8n (ex: `https://seu-n8n.up.railway.app`)
2. Faça login com:
   - **Usuário**: `admin` (ou o que você configurou em `N8N_BASIC_AUTH_USER`)
   - **Senha**: A senha que você configurou em `N8N_BASIC_AUTH_PASSWORD`

### 2. Importar Workflow

1. No n8n, clique em **"Workflows"** → **"Import from File"**
2. Selecione o arquivo `n8n-workflow.json` ou `n8n-workflow-simple.json` deste repositório
3. O workflow será importado

### 3. Configurar Credenciais

#### Se usar workflow completo (com OpenAI):

1. No n8n, vá em **Settings** → **Credentials**
2. Clique em **"Add Credential"** → **"OpenAI API"**
3. Insira sua **API Key** da OpenAI
4. Salve como `OpenAI API`

#### Se usar workflow simples:

Não precisa de credenciais adicionais!

### 4. Configurar Variável de Ambiente no Workflow

1. No workflow importado, encontre o nó **"Criar Transação no Backend"**
2. Configure a URL para usar a variável:
   ```
   {{ $env.BACKEND_WEBHOOK_URL }}
   ```
3. OU configure diretamente: `https://seu-backend.railway.app/api/n8n/create-transaction`

### 5. Ativar Webhook

1. No workflow, encontre o nó **"Webhook - Receber Mensagem"**
2. Clique no nó
3. Clique em **"Execute Node"** para ativar
4. Copie a **URL do Webhook** gerada (ex: `https://seu-n8n.up.railway.app/webhook/receive-media`)

---

## 🔗 Integrar com Backend

### 1. Configurar Variáveis no Backend (Railway)

No serviço do backend, adicione/atualize:

```env
N8N_WEBHOOK_URL=https://seu-n8n.up.railway.app/webhook/receive-media
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

### 2. Ativar Workflow no n8n

1. No n8n, vá em **Workflows**
2. Encontre o workflow **"WhatsApp Receipt Processing"**
3. Clique no **toggle** no canto superior direito para **ativar**
4. O workflow agora está ativo e ouvindo!

---

## ✅ Testar

### 1. Teste Manual do Webhook

```bash
curl -X POST https://seu-n8n.up.railway.app/webhook/receive-media \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "test-123",
    "from": "5511999999999@s.whatsapp.net",
    "fromName": "Teste",
    "timestamp": 1704067200000,
    "text": "Comprovante de R$ 150,00",
    "mediaType": "image",
    "mediaUrl": "https://example.com/test.jpg",
    "fileName": "test.jpg",
    "mimeType": "image/jpeg"
  }'
```

### 2. Teste Completo

1. Envie uma imagem de comprovante via WhatsApp
2. Verifique os logs do backend (deve enviar para n8n)
3. Verifique os logs do n8n (deve processar)
4. Verifique o Firestore (deve criar transação)

---

## 📊 Monitorar

### Logs do n8n

1. No Railway, vá no serviço do n8n
2. Aba **"Deployments"** → Clique no deployment ativo
3. Veja os logs em tempo real

### Execuções do Workflow

1. No n8n, vá em **Executions**
2. Veja todas as execuções do workflow
3. Clique para ver detalhes e debug

---

## 🔐 Segurança

### ⚠️ IMPORTANTE

1. **SEMPRE** configure autenticação básica:
   ```env
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=seu_usuario
   N8N_BASIC_AUTH_PASSWORD=sua_senha_segura
   ```

2. **Use HTTPS** (Railway já fornece)

3. **Proteja credenciais** - Nunca commite `.env` ou credenciais

4. **Configure whitelist** no backend (`WHATSAPP_WHITELIST`)

---

## 🔧 Troubleshooting

### n8n não inicia

- Verifique se a porta está configurada: `5678`
- Verifique variáveis de ambiente obrigatórias
- Veja logs no Railway

### Webhook não recebe requisições

- Verifique se o workflow está **ativado**
- Verifique se o webhook está **executado** (Execute Node)
- Verifique a URL no backend (`N8N_WEBHOOK_URL`)

### Workflow não processa corretamente

- Verifique credenciais (OpenAI, se usar)
- Verifique `BACKEND_WEBHOOK_URL` no n8n
- Veja logs de execução no n8n

### Erro de conexão com backend

- Verifique se `BACKEND_WEBHOOK_URL` está correto
- Verifique se o backend está rodando
- Verifique CORS no backend

---

## 📚 Recursos

- [Documentação n8n](https://docs.n8n.io/)
- [n8n no Railway](https://docs.n8n.io/hosting/installation/railway/)
- [Templates n8n](https://n8n.io/workflows/)

---

**Pronto! Seu n8n está configurado e integrado!** 🎉

