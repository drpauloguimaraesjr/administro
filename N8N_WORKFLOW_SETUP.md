# 🚀 Workflow n8n - Setup Completo com Vision OCR

## 📦 Workflows Disponíveis

1. **`n8n-workflow.json`** - Versão atual (usa nó OpenAI do n8n)
2. **`n8n-workflow-simple.json`** - Versão simples sem OCR (só texto)
3. **`n8n-workflow-vision-melhorado.json`** - ⭐ **RECOMENDADO** - Versão melhorada com GPT-4 Vision via API HTTP

## 🎯 Workflow Recomendado: Vision Melhorado

O workflow `n8n-workflow-vision-melhorado.json` foi criado baseado no workflow do NutriBuddy e inclui:

✅ **Download de imagem** do Firebase Storage
✅ **Conversão para Base64** (necessário para Vision)
✅ **GPT-4 Vision OCR** via API HTTP direta (mais confiável)
✅ **Processamento inteligente** dos dados extraídos
✅ **Validação e normalização** automática
✅ **Tratamento de erros** robusto

---

## 📝 Como Importar e Configurar

### 1. Importar Workflow no n8n

1. Acesse seu n8n: `https://n8n-production-b581.up.railway.app`
2. Vá em **Workflows** → **Import from File**
3. Selecione: `n8n-workflow-vision-melhorado.json`
4. O workflow será importado

### 2. Configurar Credenciais OpenAI

#### Opção A: HTTP Header Auth (Recomendado)

1. No n8n, vá em **Settings** → **Credentials**
2. Clique em **Add Credential** → **HTTP Header Auth**
3. Configure:
   - **Name:** `OpenAI API`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer sua-api-key-openai-aqui`
4. Salve

#### Opção B: OpenAI API Credential (Se disponível)

1. **Settings** → **Credentials** → **Add Credential**
2. Escolha **OpenAI API**
3. Insira sua **API Key**
4. Salve

### 3. Configurar Credenciais no Nó Vision

1. Abra o workflow importado
2. Clique no nó **"GPT-4 Vision - OCR"**
3. Em **Credentials**, selecione a credencial OpenAI que você criou
4. Salve o workflow

### 4. Configurar Variável de Ambiente

No Railway → Variables do serviço n8n:

```env
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

**OU** configure diretamente no nó "Criar Transação no Backend":
- Edite o nó
- Altere a URL para: `https://seu-backend.railway.app/api/n8n/create-transaction`

### 5. Ativar Webhook

1. No workflow, encontre o nó **"Webhook - Receber Mensagem"**
2. Clique no nó
3. Clique em **"Execute Node"** ou **"Listen for Test Event"**
4. Isso ativa o webhook e gera a URL
5. Copie a URL gerada (ex: `https://n8n-production-b581.up.railway.app/webhook/receive-media`)

### 6. Configurar Backend

No Railway → Variables do serviço backend:

```env
N8N_WEBHOOK_URL=https://n8n-production-b581.up.railway.app/webhook/receive-media
```

### 7. Ativar Workflow

1. No n8n, clique no **toggle** no canto superior direito do workflow
2. O workflow agora está **ATIVO** e ouvindo! ✅

---

## 🔍 Diferenças Entre os Workflows

### n8n-workflow.json (Atual)
- ✅ Usa nó OpenAI do n8n
- ⚠️ Pode ter problemas de compatibilidade
- ✅ Mais simples de configurar

### n8n-workflow-simple.json
- ✅ Não precisa de OpenAI
- ✅ Processa apenas texto da mensagem
- ⚠️ Não faz OCR de imagem
- ✅ Útil para testes

### n8n-workflow-vision-melhorado.json ⭐
- ✅ Usa API HTTP direta (mais confiável)
- ✅ Baseado no workflow do NutriBuddy
- ✅ Processamento robusto de erros
- ✅ Validação completa de dados
- ✅ Suporte a Base64 (necessário para Vision)
- ⭐ **RECOMENDADO PARA PRODUÇÃO**

---

## 🧪 Testar o Workflow

### Teste Manual

```bash
curl -X POST https://n8n-production-b581.up.railway.app/webhook/receive-media \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "test-123",
    "from": "5511999999999@s.whatsapp.net",
    "mediaType": "image",
    "mediaUrl": "https://exemplo.com/comprovante.jpg",
    "text": "Comprovante de R$ 150,00"
  }'
```

### Teste Real

1. Envie uma imagem de comprovante via WhatsApp
2. O backend detecta e envia para o n8n
3. O n8n processa com Vision OCR
4. Cria transação no Firestore
5. ✅ Pronto!

---

## 🔧 Troubleshooting

### Erro: "Cannot find credential"
→ Configure as credenciais OpenAI no nó Vision

### Erro: "Invalid API key"
→ Verifique se a API key está correta no formato: `Bearer sk-...`

### Erro: "Image download failed"
→ Verifique se a URL da imagem está acessível
→ Verifique se o Firebase Storage permite acesso público

### OCR não extrai dados corretos
→ O prompt pode ser ajustado no nó "GPT-4 Vision - OCR"
→ Aumente `max_tokens` se necessário
→ Verifique os logs de execução no n8n

---

## 📊 Monitorar Execuções

1. No n8n, vá em **Executions**
2. Veja todas as execuções do workflow
3. Clique para ver detalhes e debug
4. Veja os dados extraídos em cada etapa

---

**Pronto! Seu workflow está configurado com Vision OCR!** 🎉

