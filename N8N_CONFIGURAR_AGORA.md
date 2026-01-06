# ✅ Como Finalizar a Configuração do Workflow n8n

## 🔴 Problemas Identificados na Imagem

Vejo que há 2 problemas no nó "GPT-4 Vision - OCR":

1. ❌ **Método HTTP está como GET** (deveria ser POST)
2. ❌ **Credenciais não configuradas** (triângulo vermelho)

---

## 🔧 Passo a Passo para Corrigir

### 1. Corrigir Método HTTP

1. No n8n, clique no nó **"GPT-4 Vision - OCR"**
2. No campo **"Method"** (ou "HTTP Method"), mude de **GET** para **POST**
3. Salve o workflow

### 2. Configurar Credenciais OpenAI

#### Opção A: HTTP Header Auth (Recomendado)

1. No n8n, vá em **Settings** → **Credentials**
2. Clique em **"Add Credential"**
3. Escolha **"HTTP Header Auth"**
4. Configure:
   - **Name:** `OpenAI API`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer sua-api-key-openai-aqui`
     - ⚠️ **IMPORTANTE:** Substitua `sua-api-key-openai-aqui` pela sua chave real da OpenAI
     - Formato: `Bearer sk-proj-...` ou `Bearer sk-...`
5. Clique em **"Save"**

#### Opção B: Usar Credencial Existente

Se você já tem uma credencial OpenAI configurada:
1. Clique no nó **"GPT-4 Vision - OCR"**
2. Em **"Authentication"** → **"Generic Credential Type"**
3. Selecione sua credencial existente
4. Salve o workflow

### 3. Verificar Modelo

1. No nó **"GPT-4 Vision - OCR"**, verifique o campo **"JSON Body"**
2. Certifique-se de que o modelo está como: `"gpt-4o"` (não `"gpt-40"`)
3. Se estiver errado, corrija para: `"gpt-4o"`

### 4. Configurar URL do Backend

1. Clique no nó **"Criar Transação no Backend"**
2. No campo **"URL"**, configure:
   ```
   https://administro-production.up.railway.app/api/n8n/create-transaction
   ```
   OU use a variável de ambiente:
   ```
   {{ $env.BACKEND_WEBHOOK_URL }}
   ```
3. Salve o workflow

### 5. Ativar Webhook

1. Clique no nó **"Webhook - Receber Mensagem"**
2. Clique em **"Execute Node"** ou **"Listen for Test Event"**
3. Isso ativa o webhook e gera a URL
4. **Copie a URL gerada** (ex: `https://n8n-production-b581.up.railway.app/webhook/receive-media`)

### 6. Configurar Backend

No Railway → Variables do serviço **backend**:

```env
N8N_WEBHOOK_URL=https://n8n-production-b581.up.railway.app/webhook/receive-media
```

**⚠️ IMPORTANTE:** Use a URL que você copiou no passo 5!

### 7. Ativar Workflow

1. No canto superior direito do workflow, clique no **toggle** (interruptor)
2. Ele deve ficar **verde/ativo**
3. ✅ Pronto!

---

## ✅ Checklist Final

Antes de testar, verifique:

- [ ] Método HTTP está como **POST** (não GET)
- [ ] Credenciais OpenAI configuradas (sem triângulo vermelho)
- [ ] Modelo está como `"gpt-4o"` (não `"gpt-40"`)
- [ ] URL do backend configurada corretamente
- [ ] Webhook ativado (Execute Node)
- [ ] URL do webhook copiada e configurada no backend
- [ ] Workflow está **ATIVO** (toggle verde)

---

## 🧪 Testar

### Teste Manual

1. No n8n, clique em **"Execute Workflow"** (botão vermelho)
2. Ou envie uma imagem via WhatsApp
3. Verifique os logs em **Executions**

### Verificar Logs

1. No n8n, vá em **Executions**
2. Clique na execução mais recente
3. Veja os dados em cada nó
4. Se houver erro, veja qual nó falhou

---

## 🆘 Se Ainda Tiver Problemas

### Erro: "Invalid API key"
→ Verifique se a chave está no formato: `Bearer sk-...`
→ Verifique se a chave está correta

### Erro: "Method not allowed"
→ Certifique-se de que o método está como **POST**

### Erro: "Cannot find credential"
→ Configure as credenciais no nó Vision
→ Ou crie uma nova credencial em Settings → Credentials

### Webhook não recebe requisições
→ Certifique-se de que o webhook foi ativado (Execute Node)
→ Verifique se a URL está correta no backend

---

**Depois de seguir esses passos, seu workflow estará pronto!** 🎉

