# 🚂 Como Configurar Variáveis no Railway - Raw Editor

## 📋 Passo a Passo

### 1. Acesse o Raw Editor
1. No Railway Dashboard, vá na aba **Variables**
2. Clique em **Raw Editor** (não use JSON, use o modo ENV)

### 2. Cole o Conteúdo Completo
1. Abra o arquivo `RAILWAY_RAW_EDITOR.env`
2. **Selecione TODO o conteúdo** (Ctrl+A / Cmd+A)
3. **Copie** (Ctrl+C / Cmd+C)
4. **Cole** no Raw Editor do Railway

### 3. Salvar
1. Clique em **"Update Variables"**
2. O Railway vai salvar todas as variáveis automaticamente

---

## ✅ O que está incluído:

```
NODE_ENV=production
FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT={JSON completo}
WHATSAPP_WHITELIST=
N8N_WEBHOOK_URL=
BACKEND_WEBHOOK_URL=
```

---

## ⚠️ IMPORTANTE:

- Use o modo **ENV** no Raw Editor (não JSON)
- Cole TODO o conteúdo de uma vez
- A variável `FIREBASE_SERVICE_ACCOUNT` deve estar em UMA LINHA
- Não adicione quebras de linha dentro do JSON

---

## 🔄 Após Salvar:

1. O Railway vai reiniciar automaticamente o serviço
2. Aguarde o deploy completar
3. Verifique os logs para confirmar que iniciou corretamente

---

## 🧪 Teste:

Após o deploy, teste o endpoint de health:

```bash
curl https://sua-url-railway.app/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

---

## 📝 Nota sobre BACKEND_WEBHOOK_URL:

Após obter a URL do seu serviço no Railway, volte aqui e atualize:
```
BACKEND_WEBHOOK_URL=https://sua-url.railway.app/api/n8n/create-transaction
```

