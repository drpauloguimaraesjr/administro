# 🚀 Deploy Agora - Railway e Vercel

## ✅ Commit e Push Realizados!

As mudanças foram commitadas e enviadas para o GitHub. Agora você precisa:

## 🚂 1. Configurar Variáveis no Railway

1. Acesse o [Railway Dashboard](https://railway.app/dashboard)
2. Vá no seu projeto **administro**
3. Clique em **Variables**
4. Clique em **Raw Editor** (aba ENV)
5. **Copie TODO o conteúdo** de `RAILWAY_RAW_EDITOR.env`
6. **Cole no Raw Editor**
7. Clique em **Update Variables**
8. ✅ Quando as cores mudarem, está correto!

## ▲ 2. Configurar Variáveis no Vercel

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá no seu projeto **administro**
3. Vá em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis (uma por uma):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDKxHxISTitakS8o8sJmebsXpiTRAiqTXo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=administro-af341.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=administro-af341
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=857150753142
NEXT_PUBLIC_FIREBASE_APP_ID=1:857150753142:web:375eea8cb1e8c92b33d257
NEXT_PUBLIC_BACKEND_URL=https://administro-production.up.railway.app
```

⚠️ **IMPORTANTE:**
- URL do backend: `https://administro-production.up.railway.app` (sem barra final!)
- Configure para **Production**, **Preview** e **Development**
- Depois de adicionar, faça um novo deploy no Vercel

## 📝 3. Verificar Deploy

### Railway:
- Acesse a aba **Deployments** no Railway
- Aguarde o deploy completar
- Verifique os logs para ver se iniciou corretamente

### Vercel:
- Acesse a aba **Deployments** no Vercel
- Aguarde o deploy completar
- Acesse a URL do deploy para testar

## ✅ Pronto!

Depois de configurar as variáveis nos dois serviços, tudo deve funcionar perfeitamente! 🎉

