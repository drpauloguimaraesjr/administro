# 🚀 Workflow n8n - Guia Rápido

## 📦 O que foi criado

1. **Rota Backend** (`/api/n8n/create-transaction`) - Recebe transações processadas do n8n
2. **Integração WhatsApp → n8n** - Envia mensagens com imagem automaticamente para o n8n
3. **Upload de Mídia** - Salva comprovantes no Firebase Storage
4. **Workflows n8n** - 2 versões disponíveis:
   - `n8n-workflow.json` - Completo com OCR via OpenAI Vision
   - `n8n-workflow-simple.json` - Versão simples sem OCR (usa apenas texto)

## 🎯 Fluxo Completo

```
WhatsApp → Backend → n8n → Backend → Firestore
   📱         🖥️        🔄         🖥️        🗄️
```

1. **Usuário envia imagem** via WhatsApp
2. **Backend detecta** mensagem com imagem
3. **Backend faz upload** para Firebase Storage
4. **Backend envia** dados para n8n (webhook)
5. **n8n processa** imagem (OCR)
6. **n8n extrai** informações (valor, data, categoria, etc.)
7. **n8n cria transação** no backend via API
8. **Backend salva** no Firestore

## ⚡ Setup Rápido (5 minutos)

### 1. Configure as Variáveis no Backend

No Railway ou `.env` local:

```env
N8N_WEBHOOK_URL=https://seu-n8n.railway.app/webhook/receive-media
BACKEND_WEBHOOK_URL=https://seu-backend.railway.app/api/n8n/create-transaction
```

### 2. Importe o Workflow no n8n

1. Acesse seu n8n
2. Vá em **Workflows** → **Import from File**
3. Escolha `n8n-workflow.json` (com OCR) ou `n8n-workflow-simple.json` (simples)
4. Configure credenciais OpenAI (se usar versão completa)
5. Ative o webhook

### 3. Teste

Envie uma imagem de comprovante via WhatsApp!

---

## 📚 Documentação Completa

Veja `N8N_SETUP.md` para documentação detalhada.

---

**Pronto para produção!** 🎉

