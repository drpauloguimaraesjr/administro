# 🔄 Configuração do n8n para Processamento de Comprovantes

Este guia explica como configurar o n8n para processar comprovantes enviados via WhatsApp e criar transações automaticamente no sistema.

## 📋 Pré-requisitos

1. **n8n instalado e rodando** (self-hosted no Railway ou local)
2. **Backend configurado e rodando** com a URL conhecida
3. **Credenciais OpenAI** (para OCR com Vision) OU **Google Cloud Vision API** (alternativa)
4. **Variáveis de ambiente configuradas** no backend:
   - `N8N_WEBHOOK_URL` - URL do webhook do n8n
   - `BACKEND_WEBHOOK_URL` - URL do endpoint do backend (`/api/n8n/create-transaction`)

---

## 🚀 Passo a Passo

### 1. Importar o Workflow

1. Acesse seu n8n (ex: `https://seu-n8n.railway.app`)
2. Vá em **Workflows** → **Import from File**
3. Selecione o arquivo `n8n-workflow.json`
4. O workflow será importado com os nós configurados

### 2. Configurar Credenciais

#### OpenAI API (Recomendado)

1. No n8n, vá em **Settings** → **Credentials**
2. Clique em **Add Credential** → **OpenAI API**
3. Insira sua **API Key** da OpenAI
4. Salve como `OpenAI API`

#### Google Cloud Vision (Alternativa)

Se preferir usar Google Vision ao invés de OpenAI:

1. Crie uma credencial no [Google Cloud Console](https://console.cloud.google.com)
2. No n8n, adicione credencial **Google Cloud Vision API**
3. Use o nó **Google Cloud Vision** no workflow

### 3. Configurar Variáveis de Ambiente no n8n

No n8n, configure as seguintes variáveis de ambiente:

- `BACKEND_WEBHOOK_URL` - URL completa do seu backend:
  ```
  https://seu-backend.railway.app/api/n8n/create-transaction
  ```

### 4. Ativar o Webhook

1. No workflow importado, encontre o nó **Webhook - Receber Mensagem**
2. Clique em **Execute Node** para ativar o webhook
3. Copie a **URL do Webhook** gerada (ex: `https://seu-n8n.railway.app/webhook/receive-media`)
4. Configure no backend (variável `N8N_WEBHOOK_URL`)

### 5. Configurar o Backend

No arquivo `.env` do backend ou no Railway:

```env
N8N_WEBHOOK_URL=https://seu-n8n.railway.app/webhook/receive-media
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

---

## 🔄 Fluxo do Workflow

O workflow funciona da seguinte forma:

1. **Webhook recebe mensagem** do backend quando chega imagem no WhatsApp
2. **IF verifica** se é uma imagem
3. **Download** da imagem do Firebase Storage
4. **OCR** usando OpenAI Vision para extrair dados:
   - Valor (amount)
   - Tipo (income/expense)
   - Data
   - Descrição
   - Categoria
   - Contexto (HOME/CLINIC)
5. **Processa dados** extraídos e valida
6. **Cria transação** no backend via API
7. **Responde** com sucesso ou erro

---

## 📝 Estrutura dos Dados

### Payload Recebido do Backend (Webhook)

```json
{
  "messageId": "message-123",
  "from": "5511999999999@s.whatsapp.net",
  "fromName": "João Silva",
  "timestamp": 1704067200000,
  "text": "Comprovante de pagamento",
  "mediaType": "image",
  "mediaUrl": "https://firebasestorage.googleapis.com/...",
  "fileName": "receipt.jpg",
  "mimeType": "image/jpeg"
}
```

### Payload Enviado para o Backend

```json
{
  "amount": 150.00,
  "type": "expense",
  "date": "2024-01-01",
  "description": "Almoço no restaurante",
  "category": "Alimentação",
  "contextId": "HOME",
  "attachmentUrl": "https://firebasestorage.googleapis.com/..."
}
```

---

## 🔧 Personalização do Workflow

### Ajustar Prompt do OCR

No nó **OpenAI Vision - OCR**, você pode personalizar o prompt para extrair informações específicas:

```
Analise esta imagem de comprovante bancário/recibo. Extraia:
- Valor total (amount)
- Tipo: "income" se for receita, "expense" se for despesa
- Data da transação (formato YYYY-MM-DD)
- Descrição breve
- Categoria (ex: Alimentação, Transporte, Salário, Consulta, etc.)
- Contexto: "HOME" para pessoal, "CLINIC" para clínica
```

### Adicionar Validações

Você pode adicionar nós de validação antes de criar a transação:

1. Verificar se o valor é maior que zero
2. Validar formato da data
3. Classificar categoria automaticamente baseado em palavras-chave

### Adicionar Notificações

Após criar a transação, você pode:

1. Enviar confirmação via WhatsApp
2. Enviar email
3. Salvar log em arquivo

---

## 🧪 Testar o Workflow

### 1. Teste Manual

1. Ative o workflow no n8n
2. Envie uma imagem de comprovante via WhatsApp para o número conectado
3. Verifique os logs no n8n para ver o processamento
4. Verifique se a transação foi criada no Firestore

### 2. Teste via Postman/curl

```bash
curl -X POST https://seu-n8n.railway.app/webhook/receive-media \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "test-123",
    "from": "5511999999999@s.whatsapp.net",
    "fromName": "Teste",
    "timestamp": 1704067200000,
    "text": "Teste",
    "mediaType": "image",
    "mediaUrl": "https://example.com/image.jpg",
    "fileName": "test.jpg",
    "mimeType": "image/jpeg"
  }'
```

---

## ⚠️ Troubleshooting

### Webhook não recebe mensagens

- Verifique se `N8N_WEBHOOK_URL` está configurado corretamente no backend
- Verifique se o webhook está ativo no n8n
- Verifique os logs do backend para ver se está tentando enviar

### OCR não extrai dados corretos

- Ajuste o prompt do OpenAI Vision
- Verifique se a imagem está clara e legível
- Adicione validações e valores padrão no nó de processamento

### Erro ao criar transação

- Verifique se `BACKEND_WEBHOOK_URL` está correto no n8n
- Verifique se o backend está rodando
- Verifique os logs do backend para ver o erro exato
- Teste a rota `/api/n8n/create-transaction` manualmente

### Imagem não faz download

- Verifique se a URL do Firebase Storage está acessível
- Verifique permissões do Firebase Storage
- Verifique se a URL não expirou (signed URLs têm validade)

---

## 📚 Recursos Adicionais

- [Documentação n8n](https://docs.n8n.io/)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Google Cloud Vision](https://cloud.google.com/vision/docs)

---

## 🔐 Segurança

1. **Webhook**: Configure autenticação no webhook do n8n (opcional mas recomendado)
2. **API Keys**: Nunca commite credenciais. Use variáveis de ambiente
3. **Validação**: Sempre valide dados recebidos antes de processar
4. **Rate Limiting**: Configure limites de requisições no n8n

---

## 🎯 Próximos Passos

Após configurar o workflow básico, você pode:

1. Adicionar categorização automática inteligente
2. Implementar aprendizado de padrões (ML)
3. Adicionar confirmação via WhatsApp
4. Criar relatórios automáticos
5. Integrar com outros serviços

---

**Pronto!** Seu workflow está configurado e pronto para processar comprovantes automaticamente. 🎉

