# 🔧 Fix: Erro Trust Proxy no n8n

## ❌ Problema

O erro aparece nos logs:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

## ✅ Solução

Adicione esta variável de ambiente no Railway:

```env
N8N_TRUST_PROXY=true
```

## 📝 Passo a Passo

1. **Railway Dashboard** → Seu serviço n8n
2. Vá em **Variables**
3. Clique em **"New Variable"**
4. Adicione:
   - **Name:** `N8N_TRUST_PROXY`
   - **Value:** `true`
5. Clique em **"Add"**
6. O Railway vai fazer redeploy automaticamente

## 🎯 Por que isso é necessário?

O Railway usa um proxy reverso. Quando você acessa o n8n, o Railway adiciona headers como `X-Forwarded-For` para indicar o IP real do cliente. O n8n precisa "confiar" nesses headers para funcionar corretamente com rate limiting e segurança.

---

**Depois de adicionar a variável, aguarde alguns minutos e o erro deve desaparecer!** ✅

