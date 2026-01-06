# ✅ Checklist para Produção

Use este checklist para garantir que tudo está configurado corretamente antes de colocar em produção.

## 🔵 Backend (Railway)

### Variáveis de Ambiente
- [ ] `NODE_ENV=production`
- [ ] `FIREBASE_STORAGE_BUCKET` configurado
- [ ] `FIREBASE_SERVICE_ACCOUNT` (JSON completo em uma linha)
- [ ] `WHATSAPP_WHITELIST` (números autorizados, separados por vírgula)
- [ ] `WHATSAPP_AUTO_START=true`
- [ ] `N8N_WEBHOOK_URL` (URL do webhook do n8n)
- [ ] `BACKEND_WEBHOOK_URL` (URL do próprio backend: `/api/n8n/create-transaction`)

### Testes
- [ ] Health check funciona: `GET /health`
- [ ] WhatsApp conecta: `GET /api/whatsapp/status`
- [ ] QR Code aparece: `GET /api/whatsapp/qr`
- [ ] Endpoint n8n funciona: `GET /api/n8n/health`

### Funcionalidades
- [ ] WhatsApp conecta e mantém sessão
- [ ] Mensagens com imagem são processadas
- [ ] Mídia é enviada para o n8n
- [ ] Transações são criadas no Firestore

---

## 🟢 Frontend (Vercel)

### Variáveis de Ambiente
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_BACKEND_URL` (URL do backend no Railway)

### Testes
- [ ] Frontend faz build sem erros
- [ ] Firebase inicializa corretamente
- [ ] Consegue conectar com o backend

---

## 🔄 n8n

### Configuração
- [ ] n8n rodando e acessível
- [ ] Workflow importado (`n8n-workflow.json` ou `n8n-workflow-simple.json`)
- [ ] Credenciais OpenAI configuradas (se usar versão completa)
- [ ] Variável `BACKEND_WEBHOOK_URL` configurada no n8n
- [ ] Webhook ativado e URL copiada

### Testes
- [ ] Webhook recebe requisições do backend
- [ ] OCR extrai dados corretamente (se usar versão completa)
- [ ] Transação é criada no backend após processamento

---

## 🔐 Firebase

### Configurações
- [ ] Firestore Database criado
- [ ] Storage Bucket criado
- [ ] Regras de segurança configuradas
- [ ] Service Account criada e configurada no backend

### Testes
- [ ] Backend consegue escrever no Firestore
- [ ] Backend conseve fazer upload no Storage
- [ ] URLs de mídia são acessíveis

---

## 📱 WhatsApp

### Configuração
- [ ] WhatsApp conectado via QR Code
- [ ] Whitelist configurada (se necessário)
- [ ] Números de teste adicionados na whitelist

### Testes
- [ ] Envia mensagem de texto → Recebe
- [ ] Envia imagem → Processa e cria transação
- [ ] Confirmação funciona (se implementado)

---

## 🔄 Fluxo Completo

### Teste End-to-End
1. [ ] Envia imagem de comprovante via WhatsApp
2. [ ] Backend detecta mensagem
3. [ ] Backend faz upload para Firebase Storage
4. [ ] Backend envia para n8n
5. [ ] n8n processa imagem (OCR)
6. [ ] n8n extrai dados
7. [ ] n8n cria transação no backend
8. [ ] Backend salva no Firestore
9. [ ] Transação aparece no sistema

---

## 📊 Monitoramento

### Logs
- [ ] Logs do backend acessíveis (Railway)
- [ ] Logs do frontend acessíveis (Vercel)
- [ ] Logs do n8n acessíveis
- [ ] Alertas configurados (opcional)

### Métricas
- [ ] Health checks monitorados
- [ ] Taxa de sucesso de transações
- [ ] Tempo de processamento

---

## 🔒 Segurança

### Backend
- [ ] Variáveis de ambiente não expostas
- [ ] Service Account seguro
- [ ] Whitelist de WhatsApp configurada
- [ ] CORS configurado corretamente

### Frontend
- [ ] Variáveis `NEXT_PUBLIC_*` são públicas (OK)
- [ ] Firebase configurado corretamente
- [ ] Autenticação implementada (se necessário)

### n8n
- [ ] Webhook com autenticação (opcional mas recomendado)
- [ ] API Keys seguras
- [ ] Acesso restrito ao n8n

---

## 📝 Documentação

- [ ] README atualizado
- [ ] Variáveis de ambiente documentadas
- [ ] Workflow n8n documentado
- [ ] Troubleshooting documentado

---

## 🎯 Pronto para Produção!

Quando todos os itens estiverem marcados, seu sistema está pronto para produção! 🚀

### Próximos Passos (Opcional)

- [ ] Configurar backup automático do Firestore
- [ ] Implementar retry para falhas no n8n
- [ ] Adicionar notificações de erro
- [ ] Configurar CI/CD completo
- [ ] Adicionar testes automatizados

---

**Última atualização:** 2024-01-01

